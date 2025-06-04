"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Web3 from 'web3';
import type { NetworkConfig } from '@config/network.config';
import { getActiveNetworkConfig, DEFAULT_TARGET_NETWORK_ID } from '@config/network.config';
import type { KycApiResponse, KycStatus, KycApiResult } from '@lib/interface/graphite.interface';

interface WalletState {
  web3: Web3 | null;
  account: string | null;
  chainId: string | null;
  networkName: string | null;
  balance: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  kycStatus: KycStatus | null;
  activeNetworkConfig: NetworkConfig;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (newNetworkId: 'mainnet' | 'testnet') => Promise<boolean>;
  checkKyc: () => Promise<void>;
}

export function useWallet(): WalletState {
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [activeNetworkConfig, setActiveNetworkConfig] = useState<NetworkConfig>(getActiveNetworkConfig(DEFAULT_TARGET_NETWORK_ID));
  const [hasManuallyDisconnected, setHasManuallyDisconnected] = useState(false); // New state

  const clearState = useCallback((isManualDisconnect = false) => {
    setWeb3Instance(null);
    setAccount(null);
    setChainId(null);
    setNetworkName(null);
    setBalance(null);
    setIsConnected(false);
    setKycStatus(null);
    if (isManualDisconnect) {
      setHasManuallyDisconnected(true);
    }
    // Removing listeners should happen in the useEffect cleanup to avoid issues
    // if window.ethereum itself becomes unavailable or changes.
  }, []);


  const checkKycStatus = useCallback(async (address: string, networkConfig: NetworkConfig) => {
    if (!networkConfig.kycApiKey) {
      console.warn("[useWallet] KYC API Key is missing for", networkConfig.id);
      setKycStatus({
        isActivated: false,
        kycLevel: null,
        reputation: null,
        error: "KYC check not configured.",
        checkedAt: new Date()
      });
      return;
    }
    
    setKycStatus(prev => ({
        isActivated: prev?.isActivated || false,
        kycLevel: prev?.kycLevel || null,
        reputation: prev?.reputation || null,
        activationBlockNumber: prev?.activationBlockNumber,
        kycLastUpdateBlockNumber: prev?.kycLastUpdateBlockNumber,
        error: undefined,
        checkedAt: new Date()
    }));

    try {
      const queryParams = new URLSearchParams({
        address: address,
        networkId: networkConfig.id,
      });
      const response = await fetch(`/api/kyc-proxy?${queryParams.toString()}`);
      
      const responseBodyText = await response.text();

      if (!response.ok) {
        let errorData;
        try {
            errorData = JSON.parse(responseBodyText);
        } catch(e) {
            errorData = { message: responseBodyText || `KYC proxy request failed: ${response.statusText}` };
        }
        throw new Error(errorData.message || `KYC proxy request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: KycApiResponse = JSON.parse(responseBodyText);

      if (data.status === "1" && typeof data.result === 'object' && data.result !== null) {
        const resultData = data.result as KycApiResult;
        setKycStatus({
          isActivated: resultData.activated,
          kycLevel: resultData.kycLevel,
          reputation: resultData.reputation,
          activationBlockNumber: resultData.activationBlockNumber,
          kycLastUpdateBlockNumber: resultData.kycLastUpdateBlockNumber,
          error: undefined,
          checkedAt: new Date(),
        });
      } else {
        const errorMessage = typeof data.result === 'string' ? data.result : data.message || "Failed to get valid KYC details via proxy.";
        setKycStatus({
          isActivated: false,
          kycLevel: null,
          reputation: null,
          error: errorMessage,
          checkedAt: new Date()
        });
      }
    } catch (e: any) {
      console.error("[useWallet] Error during KYC status check (via proxy):", e);
      setKycStatus({
        isActivated: false,
        kycLevel: null,
        reputation: null,
        error: e.message,
        checkedAt: new Date()
      });
    }
  }, []);

  const initializeState = useCallback(async (provider: any, targetConfig: NetworkConfig) => {
    setIsLoading(true);
    setError(null);
    try {
      const web3 = new Web3(provider);
      setWeb3Instance(web3);

      const accounts = await web3.eth.getAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please ensure your wallet is unlocked and connected.");
      }
      const currentAccount = accounts[0].toLowerCase();
      setAccount(currentAccount);

      const currentChainIdRaw = await web3.eth.getChainId();
      const currentChainIdHex = `0x${currentChainIdRaw.toString(16)}`;
      setChainId(currentChainIdHex);

      if (currentChainIdHex.toLowerCase() !== targetConfig.chainIdHex.toLowerCase()) {
        setError(`Wallet connected to wrong network (ID: ${currentChainIdHex}). Target: ${targetConfig.chainName} (ID: ${targetConfig.chainIdHex}). Please switch.`);
        setIsConnected(false); // Not fully connected if on wrong network
      } else {
        setNetworkName(targetConfig.chainName);
        const weiBalance = await web3.eth.getBalance(currentAccount);
        setBalance(web3.utils.fromWei(weiBalance, 'ether'));
        await checkKycStatus(currentAccount, targetConfig);
        setIsConnected(true);
        setHasManuallyDisconnected(false); // Successfully connected, reset manual disconnect flag
      }
    } catch (e: any) {
      console.error("Error initializing wallet state (useWallet):", e);
      setError(e.message || "Error initializing wallet state.");
      clearState();
    } finally {
      setIsLoading(false);
    }
  }, [clearState, checkKycStatus]);


  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask (or compatible wallet) not found. Please install it.");
      setIsLoading(false); return;
    }
    setIsLoading(true);
    setHasManuallyDisconnected(false); // User is attempting to connect
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeState(window.ethereum, activeNetworkConfig); // Pass current activeNetworkConfig
    } catch (e: any) {
      console.error("Error connecting wallet (useWallet):", e);
      setError(e.message || "Failed to connect wallet.");
      clearState();
    } finally {
      setIsLoading(false);
    }
  }, [initializeState, clearState, activeNetworkConfig]);

  const disconnectWallet = useCallback(() => {
    clearState(true); // Pass true to indicate manual disconnect
  }, [clearState]);

  const switchNetwork = useCallback(async (newNetworkId: 'mainnet' | 'testnet'): Promise<boolean> => {
    if (!window.ethereum) {
      setError("Wallet not connected or Web3 instance not available for network switch.");
      return false;
    }
    const targetConfig = getActiveNetworkConfig(newNetworkId);
    setIsLoading(true);
    setError(null);
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetConfig.chainIdHex }],
      });
      // After a successful switch, the 'chainChanged' event should trigger initializeState
      // We also update activeNetworkConfig so initializeState uses the new target.
      setActiveNetworkConfig(targetConfig);
      setIsLoading(false);
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: targetConfig.chainIdHex,
              chainName: targetConfig.chainName,
              nativeCurrency: targetConfig.nativeCurrency,
              rpcUrls: targetConfig.rpcUrls,
              blockExplorerUrls: targetConfig.blockExplorerUrls,
            }],
          });
          setActiveNetworkConfig(targetConfig);
          setIsLoading(false);
          return true; 
        } catch (addError: any) {
          setError(`Failed to add network ${targetConfig.chainName}: ${addError.message}`);
        }
      } else {
        setError(`Failed to switch network: ${switchError.message}`);
      }
    }
    setIsLoading(false);
    return false;
  }, []);


  const triggerCheckKyc = useCallback(async () => {
    if (account && activeNetworkConfig) {
      await checkKycStatus(account, activeNetworkConfig);
    } else {
      setError("Account not connected or network config unavailable for KYC check.");
      setKycStatus({ isActivated: false, kycLevel: null, reputation: null, error: "Prerequisites for KYC check not met.", checkedAt: new Date() });
    }
  }, [account, activeNetworkConfig, checkKycStatus]);

  useEffect(() => {
    const eth = window.ethereum;
    if (eth && typeof eth.on === 'function' && typeof eth.removeListener === 'function') {
      const handleAccountsChangedEvent = (accounts: string[]) => {
        if (hasManuallyDisconnected) return; // Don't re-init if user manually disconnected
        if (accounts.length === 0) {
          clearState(); // No need to pass true, as this isn't a direct user action on a button
        } else if (accounts[0].toLowerCase() !== account?.toLowerCase()) {
          initializeState(eth, activeNetworkConfig);
        }
      };
      const handleChainChangedEvent = (_chainId: string) => {
        if (hasManuallyDisconnected) return; // Don't re-init if user manually disconnected
        initializeState(eth, activeNetworkConfig);
      };

      eth.on('accountsChanged', handleAccountsChangedEvent);
      eth.on('chainChanged', handleChainChangedEvent);
      
      // Auto-connect logic if not manually disconnected and already permitted
      if (!isConnected && !isLoading && !hasManuallyDisconnected && typeof eth.request === 'function') {
          eth.request({ method: 'eth_accounts' }) // Check for existing permissions without popup
            .then((accounts: string[]) => {
                if (accounts.length > 0 && !isConnected && !hasManuallyDisconnected) { // Double check flags
                    console.log("[useWallet] Wallet already permitted on load, initializing state.");
                    initializeState(eth, activeNetworkConfig);
                }
            }).catch((e:any) => console.warn("[useWallet] Error checking eth_accounts on load:", e.message));
      }

      return () => {
        if (eth && typeof eth.removeListener === 'function') {
            eth.removeListener('accountsChanged', handleAccountsChangedEvent);
            eth.removeListener('chainChanged', handleChainChangedEvent);
        }
      };
    }
  }, [account, initializeState, clearState, isConnected, isLoading, hasManuallyDisconnected, activeNetworkConfig]);
  
  return {
    web3: web3Instance, account, chainId, networkName, balance, isConnected, isLoading, error, kycStatus,
    activeNetworkConfig, connectWallet, disconnectWallet, switchNetwork, checkKyc: triggerCheckKyc
  };
}

