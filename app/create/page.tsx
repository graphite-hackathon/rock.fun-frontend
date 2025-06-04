"use client";
import { Button, ButtonWrapper } from "@/components/ui/button";
import {
  deployGemWithMetaMask,
  DeployGemParams,
} from "@/lib/services/contract.service";
import { TextInput } from "@components/ui/input";
import { GradientText, Text } from "@components/ui/text";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  NetworkConfig,
  GRAPHITE_MAINNET_CONFIG,
  GRAPHITE_TESTNET_CONFIG,
  DEFAULT_TARGET_NETWORK_ID,
} from "@config/network.config";
import { useWallet } from "@/lib/hooks/useWallet";
import { gemApi } from "@/lib/api/api";
import type { CreateGemDto as CreateGemPayloadForBackend } from "@lib/interface/gem.interface";
import { IoChevronBack } from "react-icons/io5";

export default function CreateGemPage() {
  const {
    web3,
    account,
    connectWallet,
    error: walletErrorFromHook,
    chainId: currentMetaMaskChainIdHex,
    isConnected,
    isLoading: isWalletLoading,
    networkName: currentMetaMaskNetworkName,
    switchNetwork,
    kycStatus,
    checkKyc,
  } = useWallet();

  const [activeNetworkConfig, setActiveNetworkConfig] = useState<NetworkConfig>(
    DEFAULT_TARGET_NETWORK_ID === "mainnet"
      ? GRAPHITE_MAINNET_CONFIG
      : GRAPHITE_TESTNET_CONFIG
  );

  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [decimals, setDecimals] = useState("18");
  const [tokenImageUrl, setTokenImageUrl] = useState("");

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedContractInfo, setDeployedContractInfo] = useState<{
    address: string;
    explorerUrl?: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isOnCorrectNetwork =
    currentMetaMaskChainIdHex?.toLowerCase() ===
    activeNetworkConfig.chainIdHex.toLowerCase();
  const overallLoading = isWalletLoading || isDeploying;
  const initialButtonText = "Finish creating your gem";
  const [buttonText, setButtonText] = useState(initialButtonText);

  useEffect(() => {
    if (walletErrorFromHook) {
      toast.error(walletErrorFromHook, { theme: "dark" });
    }
  }, [walletErrorFromHook]);

  useEffect(() => {
    if (isConnected && account && activeNetworkConfig) {
      checkKyc();
    }
  }, [isConnected, account, checkKyc, activeNetworkConfig]);

  useEffect(() => {
    if (!isConnected) {
      setButtonText(
        isWalletLoading ? "Connecting Wallet..." : "Connect Wallet to Create"
      );
    } else if (!isOnCorrectNetwork) {
      setButtonText(
        isWalletLoading
          ? `Switching...`
          : `Switch to ${activeNetworkConfig.chainName}`
      );
    } else if (isDeploying) {
      setButtonText("Deploying Gem...");
    } else {
      setButtonText(initialButtonText);
    }
  }, [
    isConnected,
    isOnCorrectNetwork,
    isDeploying,
    isWalletLoading,
    activeNetworkConfig.chainName,
    initialButtonText,
  ]);

  const handleNetworkSelection = (networkId: "mainnet" | "testnet") => {
    const newConfig =
      networkId === "mainnet"
        ? GRAPHITE_MAINNET_CONFIG
        : GRAPHITE_TESTNET_CONFIG;
    setActiveNetworkConfig(newConfig);
    setDeployedContractInfo(null);
    setSuccessMessage(null);
    toast.info(`Target network set to ${newConfig.chainName}`, {
      theme: "dark",
    });
    if (isConnected && account) {
      checkKyc();
    }
  };

  const handleSubmit = async () => {
    setDeployedContractInfo(null);
    setSuccessMessage(null);

    if (!isConnected || !web3 || !account) {
      toast.error("Please connect your MetaMask wallet first.", {
        theme: "dark",
      });
      return;
    }

    if (!isOnCorrectNetwork) {
      toast.error(
        `Please switch MetaMask to ${activeNetworkConfig.chainName}. Target ID: ${activeNetworkConfig.chainIdHex}`,
        { theme: "dark" }
      );
      return;
    }

    if (!kycStatus?.isActivated) {
      toast.error(
        "Your account is not activated on Graphite. Please activate your account to deploy gems.",
        { theme: "dark", autoClose: 7000 }
      );
      return;
    }
    toast.success(
      `Account activated (KYC Level: ${kycStatus.kycLevel}). Proceeding...`,
      { theme: "dark", autoClose: 3000 }
    );

    const parsedDecimals = parseInt(decimals, 10);

    if (!tokenName.trim() || !tokenSymbol.trim() || !totalSupply.trim()) {
      toast.error("Token Name, Symbol, and Total Supply are required.", {
        theme: "dark",
      });
      return;
    }
    if (isNaN(parsedDecimals) || parsedDecimals < 0 || parsedDecimals > 50) {
      toast.error("Decimals must be a number between 0 and 50.", {
        theme: "dark",
      });
      return;
    }
    if (isNaN(parseInt(totalSupply)) || parseInt(totalSupply) <= 0) {
      toast.error("Total supply must be a positive number.", { theme: "dark" });
      return;
    }
    if (tokenSymbol.length > 10) {
      toast.error("Token symbol should be 10 characters or less.", {
        theme: "dark",
      });
      return;
    }
    if (tokenImageUrl.trim() && !/^https?:\/\//i.test(tokenImageUrl)) {
      toast.error("Token Image URL must be a valid HTTP/HTTPS URL.", {
        theme: "dark",
      });
      return;
    }

    setIsDeploying(true);
    const deployingMessage = `Deploying ${tokenName} to ${activeNetworkConfig.chainName}... This may take a moment.`;
    setSuccessMessage(deployingMessage);
    const deployToastId = toast.info(deployingMessage, {
      theme: "dark",
      autoClose: false,
      hideProgressBar: false,
    });

    try {
      const deployParams: DeployGemParams = {
        tokenName,
        symbol: tokenSymbol.toUpperCase(),
        decimals: parsedDecimals,
        nominalTotalSupply: totalSupply,
      };

      const deploymentResult = await deployGemWithMetaMask({
        web3Instance: web3,
        deployerAccount: account,
        params: deployParams,
        activeNetworkConfig: activeNetworkConfig,
      });

      toast.update(deployToastId, {
        render: `Gem contract deployed! Address: ${deploymentResult.contractAddress}. Saving to backend...`,
        type: "info",
        autoClose: false,
      });
      setSuccessMessage(
        `Gem contract deployed! Address: ${deploymentResult.contractAddress}. Saving to backend...`
      );

      const backendPayload: CreateGemPayloadForBackend = {
        contractAddress: deploymentResult.contractAddress,
        name: tokenName,
        symbol: tokenSymbol.toUpperCase(),
        decimals: parsedDecimals,
        totalSupply: totalSupply, // Storing nominal supply
        creatorAddress: account,
        networkChainId: activeNetworkConfig.chainIdHex,
        transactionHash: deploymentResult.transactionHash,
        imageUrl: tokenImageUrl.trim() || undefined,
      };

      await gemApi.createGemRecord(backendPayload).catch((err) => {
        toast.error("Gem created but could not be saved to database", {
          theme: "dark",
        });
        toast.dismiss(deployToastId);
      });

      toast.dismiss(deployToastId);
      const finalSuccessMsg = `Gem "${tokenName}" created & saved! Contract: ${deploymentResult.contractAddress}`;
      toast.success(finalSuccessMsg, { theme: "dark", autoClose: 10000 });
      setSuccessMessage(finalSuccessMsg);
      setDeployedContractInfo({
        address: deploymentResult.contractAddress,
        explorerUrl: activeNetworkConfig.blockExplorerUrls[0],
      });

      setTokenName("");
      setTokenSymbol("");
      setTotalSupply("");
      setDecimals("18");
      setTokenImageUrl("");
    } catch (e: any) {
      toast.dismiss(deployToastId);
      console.error("Gem creation process failed:", e);
      const errorMsg =
        e.response?.data?.message ||
        e.message ||
        "Unknown error occurred during gem creation.";
      toast.error(`Creation Error: ${errorMsg}`, { theme: "dark" });
      setSuccessMessage(null);
    } finally {
      setIsDeploying(false);
    }
  };

  const mainButtonAction = async () => {
    if (!isConnected) {
      await connectWallet();
    } else if (!isOnCorrectNetwork) {
      toast.info(`Requesting switch to ${activeNetworkConfig.chainName}...`, {
        theme: "dark",
      });
      await switchNetwork(activeNetworkConfig.id);
    } else {
      handleSubmit();
    }
  };

  return (
    <main
      id="create"
      className="w-full min-h-screen flex flex-col items-center desktop:px-24 px-4 pb-20"
    >
       <ButtonWrapper className="flex flex-row items-center absolute mt-10 left-0 desktop:hidden gap-x-2 font-normal text-base" onClick={()=>{window.open("/dashboard", "_self")}}>
          <IoChevronBack color="#D7DEBD" />
          <Text className="">Go to dashboard</Text>
        </ButtonWrapper>

      <GradientText className="text-4xl font-medium mt-20 mobile:mt-32 text-center w-full desktop:relative ">
        <ButtonWrapper className="flex flex-row items-center mobile:hidden gap-x-2 font-normal text-base absolute left-0" onClick={()=>{window.open("/dashboard", "_self")}}>
          <IoChevronBack color="#D7DEBD" />
          <Text className="">Go to dashboard</Text>
        </ButtonWrapper>


        Create your gem
      </GradientText>

      {/* <div className="my-4 p-3 bg-gray-800 rounded-lg shadow-md w-full max-w-md text-center text-white">
        <p className="font-semibold mb-2 text-sm">Target Network for Deployment:</p>
        <div className="flex justify-center space-x-2">
          <Button
            onClick={() => handleNetworkSelection('testnet')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                        ${activeNetworkConfig.id === 'testnet' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            text="Testnet"
            disabled={overallLoading}
          />
          <Button
            onClick={() => handleNetworkSelection('mainnet')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                        ${activeNetworkConfig.id === 'mainnet' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
            text="Mainnet"
            disabled={overallLoading}
          />
        </div>
      </div> */}

      {/* UI display for persistent success/error messages if toasts are not enough */}
      {/* {formError && <p className="my-4 text-red-400 bg-red-900/30 p-3 rounded-md text-center w-full max-w-md">{formError}</p>} */}

      {deployedContractInfo && successMessage && (
        <div className="my-4 text-green-400 bg-green-900/30 p-3 rounded-md text-center text-sm w-full max-w-md">
          <Text className="text-green-400 ">{successMessage}</Text>
          <Text className="text-green-400">
            Contract:
            {deployedContractInfo.explorerUrl &&
            deployedContractInfo.explorerUrl.startsWith("http") ? (
              <a
                href={`${deployedContractInfo.explorerUrl}/address/${deployedContractInfo.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300 break-all"
              >
                {" "}
                {deployedContractInfo.address}
              </a>
            ) : (
              <Text className="break-all"> {deployedContractInfo.address}</Text>
            )}
          </Text>
        </div>
      )}
      {!deployedContractInfo &&
        successMessage &&
        isDeploying && ( // Show "Deploying..." message
          <Text className="my-2 text-blue-400 bg-blue-900/30 tracking-wide p-3 rounded-md text-center w-full max-w-md text-sm">
            {successMessage}
          </Text>
        )}

      <div className="grid desktop:grid-cols-1 w-full gap-x-7 mt-14 gap-y-5 mobile:w-full desktop:w-[50%]">
        <TextInput
          title="Token Name"
          placeholder="Input token name (e.g., GemToken)"
          value={tokenName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTokenName(e.target.value)
          }
          disabled={overallLoading || !isConnected}
        />
        <TextInput
          title="Token Symbol"
          placeholder="Input token symbol (e.g., GEMT)"
          value={tokenSymbol}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTokenSymbol(e.target.value.toUpperCase())
          }
          maxLength={10}
          disabled={overallLoading || !isConnected}
        />
        <TextInput
          title="Total Supply"
          placeholder="Input token supply (e.g., 1000000)"
          value={totalSupply}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTotalSupply(e.target.value)
          }
          type="number"
          disabled={overallLoading || !isConnected}
        />
        <TextInput
          title="Decimals"
          placeholder="Default is 18 (e.g., 9)"
          value={decimals}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setDecimals(e.target.value)
          }
          type="number"
          min="0"
          max="50"
          disabled={overallLoading || !isConnected}
        />
        <TextInput
          title="Token Image URL (Optional)"
          placeholder="https://example.com/image.png"
          value={tokenImageUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTokenImageUrl(e.target.value)
          }
          type="url"
          disabled={overallLoading || !isConnected}
        />
      </div>

      {isConnected && (
        <div className=" p-2 flex flex-col text-neutral-600 rounded-md text-center text-xs sm:text-sm mobile:w-full desktop:w-[50%] mt-5">
          <Text className="text-neutral-400 tracking-wide">
            Connected: {account?.substring(0, 6)}...
            {account?.substring(account.length - 4)}
          </Text>
          <Text className="text-neutral-400 tracking-wide">
            Wallet Network: {currentMetaMaskNetworkName || "N/A"} (ID:{" "}
            {currentMetaMaskChainIdHex || "N/A"})
          </Text>
          {kycStatus && (
            <Text className="text-neutral-400 tracking-wide">
              Account Status:{" "}
              {kycStatus.isActivated
                ? `Activated (KYC Level ${kycStatus.kycLevel})`
                : `Not Activated (KYC Level ${
                    kycStatus.kycLevel || "N/A"
                  })`}{" "}
              {kycStatus.reputation ? `| Rep: ${kycStatus.reputation}` : ""}
            </Text>
          )}
          {kycStatus?.error && (
            <Text className="text-red-400 ">KYC Check: {kycStatus.error}</Text>
          )}
        </div>
      )}

      <Button
        className="mt-8 mb-7 mobile:w-full desktop:w-[50%]"
        text={buttonText}
        onClick={mainButtonAction}
        disabled={
          overallLoading ||
          (isConnected && !isOnCorrectNetwork && !isDeploying) ||
          (isConnected &&
            (kycStatus === null || kycStatus.isActivated === false) &&
            !isDeploying)
        }
      />

      <Text className="text-neutral-500 mb-10 text-center text-xs sm:text-sm max-w-md flex flex-col gap-y-1">
        To deploy, please make sure your wallet is connected to the selected
        target network and your account is activated on Graphite.
        <br />
        <span className="text-primary-dark text-center text-xs sm:text-sm max-w-md">
          We will later require accounts to have their KYC verified to create
          gems
        </span>
      </Text>
    </main>
  );
}
