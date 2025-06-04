import { useState, useEffect, useCallback } from "react";
import { ethers, BrowserProvider, Signer } from "ethers";
import { toast } from "react-toastify";

interface LocalAccountInfo {
  balance: string;
  active: boolean;
  kycLevel: string;
  kycFilterLevel: string;
  reputation: string;
}

interface GraphiteWalletState {
  provider: BrowserProvider | null;
  rawGraphiteProvider: Window["graphite"] | null;
  signer: Signer | null;
  account: string | null;
  balance: string | null;
  accountInfo: LocalAccountInfo | null;
  chainId: string | null;
  networkName: string | null;
  isConnected: boolean;
  isLoading: boolean; 
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

export function useGraphiteWallet(): GraphiteWalletState {
  const [rawGraphiteProvider, setRawGraphiteProvider] = useState<
    Window["graphite"] | null
  >(null);
  const [ethersProvider, setEthersProvider] = useState<BrowserProvider | null>(
    null
  );
  const [signer, setSigner] = useState<Signer | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<LocalAccountInfo | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

  let doDisconnectWallet: () => void;
  let doInitializeWalletState: (
    gProvider: NonNullable<Window["graphite"]>
  ) => Promise<void>;

  const handleAccountsChanged = useCallback(
    (accounts: string[]) => {
      if (accounts.length === 0) {
        if (doDisconnectWallet) doDisconnectWallet();
      } else if (accounts[0].toLowerCase() !== account?.toLowerCase()) {
        if (window.graphite && doInitializeWalletState) {
          doInitializeWalletState(window.graphite);
        }
      }
    },
    [account]
  );

  const handleChainChanged = useCallback((newChainId: string) => {
    if (window.graphite && doInitializeWalletState) {
      doInitializeWalletState(window.graphite);
    } else {
      window.location.reload();
    }
  }, []);

  doDisconnectWallet = useCallback(() => {
    if (rawGraphiteProvider) {
      // if (typeof rawGraphiteProvider.removeListener === "function") {
      //   rawGraphiteProvider.removeListener(
      //     "accountsChanged",
      //     handleAccountsChanged
      //   );
      //   rawGraphiteProvider.removeListener("chainChanged", handleChainChanged);
      // }
    }
    // setRawGraphiteProvider(null);
    // setEthersProvider(null);
    // setSigner(null);
    // setAccount(null);
    // setBalance(null);
    // setAccountInfo(null);
    // setChainId(null);
    // setNetworkName(null);
    // setIsConnected(false);
  }, [rawGraphiteProvider, handleAccountsChanged, handleChainChanged]);

  doInitializeWalletState = useCallback(
    async (gProvider: NonNullable<Window["graphite"]>) => {
      setError(null);
      try {
        const activeAddress = await gProvider.getAddress();
        if (!activeAddress) {
          setError("Failed to get active address.");
          setIsConnected(false);
          setAccount(null);
          setSigner(null);
          setAccountInfo(null);
          return;
        }
        setAccount(activeAddress);

        if (typeof gProvider.getAccountInfo === "function") {
          try {
            const accInfo = await gProvider.getAccountInfo();
            setAccountInfo(accInfo);
          } catch (infoError: any) {
            console.warn(
              "Could not fetch detailed account info:",
              infoError.message
            );
            setAccountInfo(null);
          }
        } else {
          setAccountInfo(null);
        }

        const ethProvider = new ethers.BrowserProvider(gProvider as any);
        setEthersProvider(ethProvider);
        const currentSigner = await ethProvider.getSigner();
        setSigner(currentSigner);

        if (typeof gProvider.getActiveNetwork === "function") {
          const network = await gProvider.getActiveNetwork();
          if (typeof network === "object" && network.chainId) {
            setChainId(network.chainId);
            setNetworkName(network.name);
          } else if (typeof network === "string") {
            setNetworkName(network);
            const detectedNetworkByEthers = await ethProvider.getNetwork();
            setChainId(detectedNetworkByEthers.chainId.toString());
            if (!networkName) setNetworkName(detectedNetworkByEthers.name);
          } else {
            setError(
              "Could not determine network information from getActiveNetwork."
            );
          }
        } else {
          const detectedNetworkByEthers = await ethProvider.getNetwork();
          setChainId(detectedNetworkByEthers.chainId.toString());
          setNetworkName(detectedNetworkByEthers.name);
        }

        if (typeof gProvider.getBalance === "function") {
          try {
            const userBalHex = await gProvider.getBalance();
            setBalance(ethers.formatEther(userBalHex));
          } catch (balError: any) {
            console.warn(
              "Could not fetch balance via gProvider.getBalance():",
              balError.message
            );
            setBalance(null);
          }
        }

        setIsConnected(true);

        if (
          typeof gProvider.on === "function" &&
          typeof gProvider.removeListener === "function"
        ) {
          gProvider.removeListener("accountsChanged", handleAccountsChanged);
          gProvider.removeListener("chainChanged", handleChainChanged);
          gProvider.on("accountsChanged", handleAccountsChanged);
          gProvider.on("chainChanged", handleChainChanged);
        }
      } catch (e: any) {
        console.error("Error initializing wallet state:", e);
        setError(e.message || "Error initializing wallet state.");
        if (doDisconnectWallet) doDisconnectWallet();
        else {
          setRawGraphiteProvider(null);
          setEthersProvider(null);
          setSigner(null);
          setAccount(null);
          setBalance(null);
          setAccountInfo(null);
          setChainId(null);
          setNetworkName(null);
          setIsConnected(false);
        }
      }
    },
    [handleAccountsChanged, handleChainChanged, networkName]
  ); // Added networkName to deps for the setNetworkName call

  const connectWallet = useCallback(async () => {
    setError(null);
    if (window.graphite) {
      try {
        const isAlreadyEnabled = await window.graphite.isEnabled();
        if (!isAlreadyEnabled) {
          await window.graphite.enable();
        }
        setRawGraphiteProvider(window.graphite);
        if (doInitializeWalletState) {
          await doInitializeWalletState(window.graphite);
        } else {
          setError("Initialization function not ready.");
        }
      } catch (e: any) {
        toast.error("Please install Graphite Wallet", {
          hideProgressBar: true,
          pauseOnHover: false,
          theme: "dark",
          delay: 2000,
        });
        window.open(
          "https://chromewebstore.google.com/detail/fbgdgmhhhlimaanngeakidegojjbbbbm?utm_source=item-share-cb",
          "_blank"
        );
        setError(e.message || "Error connecting wallet.");
        if (doDisconnectWallet) doDisconnectWallet();
      }
    } else {
      setError(
        "Graphite Wallet is not installed or available. Please install it."
      );
    }
  }, []);

  useEffect(() => {
    if (window.graphite) {
      window.graphite
        .isEnabled()
        .then((enabled) => {
          if (enabled) {
            setRawGraphiteProvider(window.graphite);
            if (doInitializeWalletState && window.graphite) {
              doInitializeWalletState(window.graphite);
            }
          }
        })
        .catch((err) =>
          console.warn(
            "Could not check if Graphite Wallet is enabled on load:",
            err.message
          )
        );
    }
  }, []);

  useEffect(() => {
    const currentProvider = rawGraphiteProvider;
    const currentAccountsHandler = handleAccountsChanged;
    const currentChainHandler = handleChainChanged;

    return () => {
      if (
        currentProvider &&
        typeof currentProvider.removeListener === "function"
      ) {
        currentProvider.removeListener(
          "accountsChanged",
          currentAccountsHandler
        );
        currentProvider.removeListener("chainChanged", currentChainHandler);
      }
    };
  }, [rawGraphiteProvider, handleAccountsChanged, handleChainChanged]);

  return {
    provider: ethersProvider,
    rawGraphiteProvider,
    signer,
    account,
    balance,
    accountInfo,
    chainId,
    networkName,
    isConnected,
    isLoading,
    connectWallet,
    disconnectWallet: doDisconnectWallet,
    error,
  };
}
