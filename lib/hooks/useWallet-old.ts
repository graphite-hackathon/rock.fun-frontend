import { useState, useEffect, useCallback } from 'react';
import { ethers, BrowserProvider, Signer } from 'ethers';

// Replace with Graphite Network's actual Chain ID
const GRAPHITE_CHAIN_ID = '440017'; // e.g., '0x...' or decimal number as string

interface WalletState {
  provider: BrowserProvider | null;
  signer: Signer | null;
  account: string | null;
  chainId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

export function useWallet(): WalletState {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    setError(null);
    if (typeof window.ethereum !== 'undefined') {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const currentChainId = (await ethProvider.getNetwork()).chainId.toString();

        if (currentChainId !== GRAPHITE_CHAIN_ID) {
          try {
             // Attempt to switch to Graphite Network
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: GRAPHITE_CHAIN_ID }],
            });
          } catch (switchError: any) {
            // Handle error if chain is not available in MetaMask or user cancels
            if (switchError.code === 4902) {
              // You might want to prompt the user to add the network
              setError(`Graphite Network (Chain ID: ${GRAPHITE_CHAIN_ID}) is not added to your wallet. Please add it manually.`);
            } else {
              setError(`Failed to switch to Graphite Network: ${switchError.message}`);
            }
            return;
          }
        }
        
        // Re-check chain ID after attempting to switch
        const finalChainId = (await ethProvider.getNetwork()).chainId.toString();
        if (finalChainId !== GRAPHITE_CHAIN_ID) {
          setError(`Please connect to Graphite Network (Chain ID: ${GRAPHITE_CHAIN_ID}). You are on ${finalChainId}.`);
          return;
        }

        setChainId(finalChainId);
        const accounts = await ethProvider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          const currentSigner = await ethProvider.getSigner();
          setProvider(ethProvider);
          setSigner(currentSigner);
          setAccount(accounts[0]);
        } else {
          setError('No accounts found. Please unlock your wallet.');
        }
      } catch (e: any) {
        console.error("Error connecting wallet:", e);
        setError(e.message || 'Error connecting wallet.');
        setProvider(null);
        setSigner(null);
        setAccount(null);
        setChainId(null);
      }
    } else {
      setError('MetaMask (or other Ethereum wallet) is not installed. Please install it.');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setError(null);
    // Potentially clear localStorage if you store connection state
  }, []);

  // Listener for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        connectWallet(); // Re-connect or update account
      }
    };

    const handleChainChanged = (_chainId: string) => {
      // Reload or prompt user, as chain change might invalidate current state
      window.location.reload(); // Simple way to handle this
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account, connectWallet, disconnectWallet]);


  return { provider, signer, account, chainId, connectWallet, disconnectWallet, error };
}