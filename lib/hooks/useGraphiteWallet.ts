"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import Web3 from 'web3';
import {ethers} from "ethers"
import type { NetworkConfig } from '@config/network.config';
import { getActiveNetworkConfig, DEFAULT_TARGET_NETWORK_ID, GRAPHITE_MAINNET_CONFIG, GRAPHITE_TESTNET_CONFIG } from '@config/network.config';
import type { GraphiteAccountInfo } from '@lib/interface/graphite.interface';


interface GraphiteWalletHookState {
  web3: Web3 | null;
  rawProvider: Window['graphite'] | null;
  account: string | null;
  chainId: string | null;
  networkName: string | null;
  balance: string | null;
  graphiteAccountInfo: GraphiteAccountInfo | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  activeNetworkConfig: NetworkConfig;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToGraphiteNetwork: (newNetworkId: 'mainnet' | 'testnet') => Promise<boolean>;
}

export function useGraphiteWallet(): GraphiteWalletHookState {
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [rawProvider, setRawProvider] = useState<Window['graphite'] | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [graphiteAccountInfo, setGraphiteAccountInfo] = useState<GraphiteAccountInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeNetworkConfig, setActiveNetworkConfig] = useState<NetworkConfig>(getActiveNetworkConfig(DEFAULT_TARGET_NETWORK_ID));

  const handleAccountsChangedGraphiteRef = useRef<((accounts: string[]) => void) | null>(null);
  const handleChainChangedGraphiteRef = useRef<((_chainId: string) => void) | null>(null);
  const initializeStateRef = useRef<((gProvider: NonNullable<Window['graphite']>) => Promise<void>) | null>(null);
  const clearStateRef = useRef<(() => void) | null>(null);

  clearStateRef.current = useCallback(() => {
    const currentProvider = rawProvider;
    if (currentProvider && typeof currentProvider.removeListener === 'function' && handleAccountsChangedGraphiteRef.current && handleChainChangedGraphiteRef.current) {
      currentProvider.removeListener('accountsChanged', handleAccountsChangedGraphiteRef.current);
      currentProvider.removeListener('chainChanged', handleChainChangedGraphiteRef.current);
    }
    setWeb3Instance(null);
    setRawProvider(null);
    setAccount(null);
    setChainId(null);
    setNetworkName(null);
    setBalance(null);
    setGraphiteAccountInfo(null);
    setIsConnected(false);
  }, [rawProvider]);

  initializeStateRef.current = useCallback(async (gProvider: NonNullable<Window['graphite']>) => {
    setIsLoading(true);
    setError(null);
    try {
      const web3 = new Web3(gProvider as any);
      setWeb3Instance(web3);
      setRawProvider(gProvider);

      const currentAccount = await gProvider.getAddress();
      if (!currentAccount) throw new Error("No account found from Graphite Wallet.");
      setAccount(currentAccount.toLowerCase());

      const currentChainIdRaw = await web3.eth.getChainId();
      const currentChainIdHex = `0x${currentChainIdRaw.toString(16)}`;
      setChainId(currentChainIdHex);

      let currentNetworkName = 'Unknown';
      if (typeof gProvider.getActiveNetwork === 'function') {
          const networkInfo = await gProvider.getActiveNetwork();
          if (typeof networkInfo === 'string') currentNetworkName = networkInfo;
          else if (networkInfo && networkInfo.name) currentNetworkName = networkInfo.name;
          else currentNetworkName = activeNetworkConfig.chainName;
      } else {
          currentNetworkName = activeNetworkConfig.chainName;
      }
      setNetworkName(currentNetworkName);

      if (currentChainIdHex.toLowerCase() !== activeNetworkConfig.chainIdHex.toLowerCase()) {
        setError(`Wallet connected to wrong network (ID: ${currentChainIdHex}). Target: ${activeNetworkConfig.chainName} (ID: ${activeNetworkConfig.chainIdHex}).`);
      } else {
        if (typeof gProvider.getBalance === 'function') {
            const weiBalanceStr = await gProvider.getBalance();
            if (weiBalanceStr) {
                 setBalance(ethers.formatUnits(BigInt(weiBalanceStr), activeNetworkConfig.nativeCurrency.decimals));
            } else {
                setBalance(null);
            }
        }

        if (typeof gProvider.getAccountInfo === 'function') {
            try {
                const accInfo = await gProvider.getAccountInfo();
                setGraphiteAccountInfo(accInfo);
            } catch (infoError: any) { console.warn("[GW] Could not fetch Graphite account info:", infoError.message); }
        }
        setIsConnected(true);
      }
    } catch (e: any) {
      console.error("[GW] Error initializing Graphite wallet state:", e);
      setError(e.message || "Error initializing Graphite wallet state.");
      clearStateRef.current?.();
    } finally {
      setIsLoading(false);
    }
  }, [activeNetworkConfig]);

  handleAccountsChangedGraphiteRef.current = (accounts: string[]) => {
    const currentAccountState = account;
    if (accounts.length === 0) {
      clearStateRef.current?.();
      setError("Graphite Wallet disconnected or no accounts found.");
    } else if (accounts[0].toLowerCase() !== currentAccountState?.toLowerCase()) {
      if (window.graphite && initializeStateRef.current) initializeStateRef.current(window.graphite);
    }
  };
  handleChainChangedGraphiteRef.current = (_chainId: string) => {
    if (window.graphite && initializeStateRef.current) initializeStateRef.current(window.graphite);
  };

  const connectWallet = useCallback(async () => {
    if (!window.graphite) {
      setError("Graphite Wallet not found. Please install it.");
      setIsLoading(false); return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window.graphite.enable === 'function') await window.graphite.enable();
      else if (typeof window.graphite.request === 'function') await window.graphite.request({ method: 'eth_requestAccounts' });
      else throw new Error("Wallet does not support enable or eth_requestAccounts.");
      
      if (initializeStateRef.current) await initializeStateRef.current(window.graphite);
    } catch (e: any) {
      console.error("[GW] Error connecting Graphite wallet:", e);
      setError(e.message || "Failed to connect Graphite wallet.");
      clearStateRef.current?.();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    clearStateRef.current?.();
  }, []);

  const switchToGraphiteNetwork = useCallback(async (newNetworkId: 'mainnet' | 'testnet'): Promise<boolean> => {
    const targetConfig = newNetworkId === 'mainnet' ? GRAPHITE_MAINNET_CONFIG : GRAPHITE_TESTNET_CONFIG;
    const currentRawProvider = rawProvider;
    if (!currentRawProvider || typeof currentRawProvider.changeActiveNetwork !== 'function') {
      setError("Graphite Wallet does not support programmatic network switching or is not connected.");
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const success = await currentRawProvider.changeActiveNetwork({
        chainId: targetConfig.chainIdHex,
        rpcUrl: targetConfig.rpcUrls[0],
        name: targetConfig.chainName,
        ticker: targetConfig.nativeCurrency.symbol,
      });
      if (success) {
        setActiveNetworkConfig(targetConfig);
      } else {
        setError(`Graphite Wallet reported failure to switch to ${targetConfig.chainName}.`);
      }
      setIsLoading(false);
      return success;
    } catch (e: any) {
      setError(`Error switching Graphite network: ${e.message}`);
    }
    setIsLoading(false);
    return false;
  }, [rawProvider]);

  useEffect(() => {
    const gProvider = window.graphite;
    if (gProvider) {
      if (handleAccountsChangedGraphiteRef.current && typeof gProvider.on === 'function') {
        gProvider.on('accountsChanged', handleAccountsChangedGraphiteRef.current);
      }
      if (handleChainChangedGraphiteRef.current && typeof gProvider.on === 'function') {
        gProvider.on('chainChanged', handleChainChangedGraphiteRef.current);
      }

       if (typeof gProvider.isEnabled === 'function') {
            gProvider.isEnabled().then(enabled => {
                if (enabled && !isConnected && !isLoading && initializeStateRef.current) {
                    initializeStateRef.current(gProvider);
                }
            }).catch(e => console.warn("[GW] Error checking isEnabled on load:", e.message));
        }

      return () => {
        if (gProvider && typeof gProvider.removeListener === 'function') {
          if (handleAccountsChangedGraphiteRef.current) gProvider.removeListener('accountsChanged', handleAccountsChangedGraphiteRef.current);
          if (handleChainChangedGraphiteRef.current) gProvider.removeListener('chainChanged', handleChainChangedGraphiteRef.current);
        }
      };
    }
  }, [isConnected, isLoading, rawProvider]); // Added rawProvider to re-attach listeners if it changes

  return {
    web3: web3Instance, rawProvider, account, chainId, networkName, balance, graphiteAccountInfo,
    isConnected, isLoading, error, activeNetworkConfig, connectWallet, disconnectWallet, switchToGraphiteNetwork
  };
}