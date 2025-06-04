// components/Web3DeployTestToken.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { TransactionReceipt } from 'web3-types'
import Web3 from 'web3';

import GemERC20AbiArray from '@lib/contracts/gem.abi.json';
import GREETER_ABI from '@lib/contracts/gretter.abi.json';
import { GEM_ERC20_BYTECODE } from '@/lib/contracts/gem.bytecode';
import { GREETER_BYTECODE } from '@/lib/contracts/greeter.bytecode';

// --- START: Network Configurations ---
interface NetworkConfig {
  id: 'mainnet' | 'testnet';
  chainIdHex: string;
  chainIdDecimal: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const GRAPHITE_MAINNET_CONFIG: NetworkConfig = {
  id: 'mainnet',
  chainIdHex: '0x6b6d1', // 440017
  chainIdDecimal: '440017',
  chainName: 'Graphite Mainnet',
  nativeCurrency: { name: 'Graphite', symbol: '@G', decimals: 18 },
  rpcUrls: ['https://anon-entrypoint-1.atgraphite.com'],
  blockExplorerUrls: ['YOUR_GRAPHITE_MAINNET_EXPLORER_URL_PLACEHOLDER'], // REPLACE
};

// Updated with details from your image
const GRAPHITE_TESTNET_CONFIG: NetworkConfig = {
  id: 'testnet',
  chainIdHex: '0xd39a', // 54170 in decimal
  chainIdDecimal: '54170',
  chainName: 'Graphite Testnet', // From "Name" field in image
  nativeCurrency: {
    name: 'Graphite', // Assuming native currency name is Graphite
    symbol: '@G',     // From "Currency Symbol" field in image
    decimals: 18,     // Common default, verify if different for Graphite Testnet
  },
  rpcUrls: ['https://anon-entrypoint-test-1.atgraphite.com'], // From "RPC URL" field
  blockExplorerUrls: ['https://test.atgraphite.com'],          // From "Explorer" field
};
// --- END: Network Configurations ---

export default function Web3DeployTestToken() {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deployedContractAddress, setDeployedContractAddress] = useState<string | null>(null);

  // Default to Testnet as requested
  const [activeNetworkConfig, setActiveNetworkConfig] = useState<NetworkConfig>(GRAPHITE_TESTNET_CONFIG);

  const log = (message: string, isError: boolean = false, isSuccess: boolean = false) => {
    console.log(`[DeployTest - ${activeNetworkConfig.id}] ${message}`);
    setLogs(prev => [...prev, message]);
    if (isError) setError(prevError => prevError ? `${prevError}\n${message}` : message);
  };

  const resetState = () => {
    setLogs([]);
    setError(null);
    setDeployedContractAddress(null);
    setIsLoading(true);
  };

  const ensureCorrectNetwork = async (web3Instance: Web3): Promise<boolean> => {
    log(`Targeting network: ${activeNetworkConfig.chainName} (ID: ${activeNetworkConfig.chainIdHex})`);
    try {
      if (!window.ethereum || typeof window.ethereum.request !== 'function') {
        log("MetaMask provider request method not available.", true);
        return false;
      }
      const currentChainIdRaw = await web3Instance.eth.getChainId();
      const currentChainIdHex = `0x${currentChainIdRaw.toString(16)}`;
      log(`MetaMask current chain ID: ${currentChainIdHex}`);

      if (currentChainIdHex.toLowerCase() !== activeNetworkConfig.chainIdHex.toLowerCase()) {
        log(`MetaMask not on ${activeNetworkConfig.chainName}. Attempting to switch/add...`);
        try {
          log(`Attempting wallet_switchEthereumChain to ${activeNetworkConfig.chainIdHex}...`);
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: activeNetworkConfig.chainIdHex }],
          });
          log(`Successfully requested switch to ${activeNetworkConfig.chainName}.`);
          const switchedChainIdRaw = await web3Instance.eth.getChainId();
          if (`0x${switchedChainIdRaw.toString(16)}`.toLowerCase() !== activeNetworkConfig.chainIdHex.toLowerCase()) {
            log(`Failed to automatically switch. User might need to confirm in MetaMask or network switch failed. Current ID: 0x${switchedChainIdRaw.toString(16)}`, true);
            return false;
          }
          log(`Successfully switched to ${activeNetworkConfig.chainName}.`);
          return true;
        } catch (switchError: any) {
          log(`Error switching network: ${switchError.message}. Code: ${switchError.code}`);
          if (switchError.code === 4902) { // 4902: Unrecognized chain ID
            log(`${activeNetworkConfig.chainName} not found in MetaMask. Attempting to add it...`);
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: activeNetworkConfig.chainIdHex,
                    chainName: activeNetworkConfig.chainName,
                    nativeCurrency: activeNetworkConfig.nativeCurrency,
                    rpcUrls: activeNetworkConfig.rpcUrls,
                    blockExplorerUrls: activeNetworkConfig.blockExplorerUrls,
                }],
              });
              log(`${activeNetworkConfig.chainName} add request sent. Please approve in MetaMask. You may need to switch manually after adding.`);
              return false; 
            } catch (addError: any) {
              log(`Error adding ${activeNetworkConfig.chainName} to MetaMask: ${addError.message}`, true);
              return false;
            }
          } else {
            log("Could not switch network. Please switch manually in MetaMask.", true);
            return false;
          }
        }
      } else {
        log(`MetaMask is already on ${activeNetworkConfig.chainName}.`);
        return true;
      }
    } catch (e:any) {
        log(`Error ensuring correct network: ${e.message}`, true);
        return false;
    }
  };

  const handleDeployTestToken = async () => {
    resetState();

    if (!window.ethereum) {
      log("MetaMask (window.ethereum) not found. Please install it.", true);
      setIsLoading(false); return;
    }
    log("MetaMask (window.ethereum) found.");

    try {
      log("Requesting account access from MetaMask...");
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts || !accounts.length) {
        log("No accounts returned from MetaMask. Please connect an account.", true);
        setIsLoading(false); return;
      }
  
      const deployerAccount = accounts[0];
      log(`Using account: ${deployerAccount}`);

      const web3 = new Web3(window.ethereum as any);
      log("Web3 instance created with window.ethereum.");

      const onCorrectNetwork = await ensureCorrectNetwork(web3);
      if (!onCorrectNetwork) {
        log("Not on the correct network or failed to switch/add. Deployment halted.", true);
        setIsLoading(false);
        return;
      }

      log("Preparing test token data...");
      const tokenName = `TestGem ${activeNetworkConfig.id}`;
      const tokenSymbol = `TG${activeNetworkConfig.id.substring(0,1).toUpperCase()}${activeNetworkConfig.id.substring(1,2)}`; // e.g. TGT or TGM
      const decimalsInput = 18;
      const nominalTotalSupply = "1000000";
      const scaledTotalSupply = (BigInt(nominalTotalSupply) * (10n ** BigInt(decimalsInput))).toString();

      log(`Deploying ${tokenName} (${tokenSymbol}) on ${activeNetworkConfig.chainName}...`);

      const contract = new web3.eth.Contract(GemERC20AbiArray as any);
      const deployArguments = [tokenName, tokenSymbol, Number(decimalsInput), scaledTotalSupply, deployerAccount];

      log("Estimating gas for deployment...");
      const gasEstimate = await contract.deploy({
        data: GEM_ERC20_BYTECODE,
        arguments: deployArguments,
      }).estimateGas({ from: deployerAccount });
      log(`Estimated gas: ${gasEstimate.toString()}`);
      const gasLimit = (BigInt(gasEstimate) * 120n / 100n).toString();
      log(`Using gas limit: ${gasLimit}`);

      log("Fetching current gas price for legacy transaction...");
      const currentGasPrice = await web3.eth.getGasPrice();
      log(`Using gasPrice: ${currentGasPrice.toString()} Wei`);

      log("Sending deployment transaction...");
      const deployedContractInstance = await contract.deploy({
        data: GEM_ERC20_BYTECODE,
        arguments: deployArguments,
      }).send({
        from: deployerAccount,
        gas: gasLimit,
        gasPrice: currentGasPrice.toString(),
      });

      const newContractAddress = deployedContractInstance.options.address;
      if (newContractAddress) {
        log(`Test Token "${tokenName}" deployed successfully on ${activeNetworkConfig.chainName}!`, false, true);
        log(`Contract Address: ${newContractAddress}`);
        setDeployedContractAddress(newContractAddress);
      } else {
        log("Deployment sent, but contract address is not yet available. Check transaction status.", true);
      }

    } catch (e: any) {
      let detailedErrorMessage = e.message || 'Unknown error';
      log(`Deployment failed: ${detailedErrorMessage}`, true);
      
      console.error("Deployment error details (FULL OBJECT):", e); // Log the full error object
      
      // Try to extract more info if it's a common RPC error structure
      if (e.data && typeof e.data === 'object' && e.data.message) {
        detailedErrorMessage += ` | RPC Data Message: ${e.data.message}`;
        log(`Error data from RPC: ${JSON.stringify(e.data)}`, true);
      } else if (typeof e.data === 'string') { // Some RPC errors might just have a string in data
        detailedErrorMessage += ` | RPC Data: ${e.data}`;
        log(`Error data from RPC (string): ${e.data}`, true);
      } else if (e.innerError && e.innerError.message) { // Check for an innerError
        detailedErrorMessage += ` | Inner Error: ${e.innerError.message}`;
        log(`Inner error: ${e.innerError.message}`, true);
      }
      
      // Update the error state with potentially more details
      setError(detailedErrorMessage); 

    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploySimpleContract = async () => {
    resetState(); // Make sure this function clears logs, errors, and sets isLoading

    if (!window.ethereum) {
      log("MetaMask (window.ethereum) not found.", true);
      setIsLoading(false); return;
    }
    log("MetaMask (window.ethereum) found.");

    try {
      log("Requesting account access from MetaMask...");
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts || !accounts.length) {
        log("No accounts returned. Please connect an account.", true);
        setIsLoading(false); return;
      }
      const deployerAccount = accounts[0];
      log(`Using account: ${deployerAccount}`);

      const web3 = new Web3(window.ethereum as any);
      log("Web3 instance created.");

      const onCorrectNetwork = await ensureCorrectNetwork(web3); // Your existing function
      if (!onCorrectNetwork) {
        log("Not on the correct network or failed to switch/add. Deployment halted.", true);
        setIsLoading(false); return;
      }
      log(`On target network: ${activeNetworkConfig.chainName}`);

      // --- Deploy Simple Greeter Contract ---
      const initialGreeting = "Hello Graphite Testnet!";
      log(`Deploying Simple Greeter contract with greeting: "${initialGreeting}"`);

 
      const contract = new web3.eth.Contract(GREETER_ABI);
      const deployArguments = [initialGreeting];

      log("Estimating gas for Greeter deployment...");
      const gasEstimate = await contract.deploy({
        data: GREETER_BYTECODE,
        arguments: deployArguments,
      }).estimateGas({ from: deployerAccount });
      log(`Estimated gas: ${gasEstimate.toString()}`);
      const gasLimit = (BigInt(gasEstimate) * 150n / 100n).toString(); // 50% buffer for simple contract
      log(`Using gas limit: ${gasLimit}`);

      log("Fetching current gas price...");
      const currentGasPrice = await web3.eth.getGasPrice();
      log(`Using gasPrice: ${currentGasPrice.toString()} Wei`);

      log("Sending Greeter deployment transaction...");
      const deployedContractInstance = await contract.deploy({
        data: GREETER_BYTECODE,
        arguments: deployArguments,
      }).send({
        from: deployerAccount,
        gas: gasLimit,
        gasPrice: currentGasPrice.toString(),
      });

      const newContractAddress = deployedContractInstance.options.address;
      if (newContractAddress) {
        log(`Simple Greeter contract deployed successfully on ${activeNetworkConfig.chainName}!`, false, true);
        log(`Contract Address: ${newContractAddress}`);
        setDeployedContractAddress(newContractAddress); // Update state to show this
      } else {
        log("Greeter deployment sent, but contract address is not yet available.", true);
      }

    } catch (e: any) {
      let detailedErrorMessage = e.message || 'Unknown error';
      log(`Simple Greeter deployment failed: ${detailedErrorMessage}`, true);
      console.error("Simple Greeter Deployment error details (FULL OBJECT):", e);
      if (e.data) { log(`Error data from RPC: ${JSON.stringify(e)}`, true); }
      setError(detailedErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTargetNetwork = (networkId: 'mainnet' | 'testnet') => {
    if (networkId === 'mainnet') {
      setActiveNetworkConfig(GRAPHITE_MAINNET_CONFIG);
      log("Target network set to: Graphite Mainnet");
    } else {
      setActiveNetworkConfig(GRAPHITE_TESTNET_CONFIG);
      log("Target network set to: Graphite Testnet");
    }
    // Clear previous deployment status when network changes
    setDeployedContractAddress(null);
    setError(null);
    setLogs(prev => [...prev, `Target network changed to ${networkId}`]);
  };

  const handleTestTransfer = async () => {
    resetState(); // Assuming resetState clears logs, errors, and sets isLoading
    // setCurrentProviderType("'MetaMask'"); // Assuming this test is also via MetaMask
    log("Attempting simple value transfer...");

    if (!window.ethereum || typeof window.ethereum.request !== 'function') {
      log("MetaMask (window.ethereum) or its request method not found.", true);
      setIsLoading(false);
      return;
    }
    log("MetaMask (window.ethereum) found.");

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (!accounts || !accounts.length) {
        log("No accounts returned from MetaMask. Please connect an account.", true);
        setIsLoading(false);
        return;
      }
      const fromAccount = accounts[0];
      log(`Using account for transfer: ${fromAccount}`);

      const web3 = new Web3(window.ethereum as any);
      log("Web3 instance created for transfer.");

      const onCorrectNetwork = await ensureCorrectNetwork(web3); // Your existing function
      if (!onCorrectNetwork) {
        log("Not on the correct target network or failed to switch/add. Transfer halted.", true);
        setIsLoading(false);
        return;
      }
      log(`On target network for transfer: ${activeNetworkConfig.chainName}`);

      
      const recipient = "0xdeF0EF605F52442405b2dbeb2ABF5d7C61778fCc"; // Sending to self for test simplicity, or use another test address you own
      const valueToSend = web3.utils.toWei("0.0001", "ether"); // Send a very small amount

      log(`Attempting to send ${web3.utils.fromWei(valueToSend, "ether")} ${activeNetworkConfig.nativeCurrency.symbol} from ${fromAccount} to ${recipient}`);
      
      const gasPrice = await web3.eth.getGasPrice(); // Returns BigInt in Web3 v4.x
      log(`Using gasPrice: ${gasPrice.toString()} Wei`);

      const promiEvent = web3.eth.sendTransaction({
        from: fromAccount,
        to: recipient,
        value: valueToSend.toString(), // Ensure value is string if web3 expects string Wei
        gas: "21000", // Standard gas for a simple ETH/native token transfer
        gasPrice: gasPrice.toString() // Ensure gasPrice is string
      });

      promiEvent
        .on('transactionHash', (hash: string) => {
          log(`Transfer TxHash: ${hash}. Check explorer: ${activeNetworkConfig.blockExplorerUrls[0]}/tx/${hash}`);
        })
        .on('receipt', (receipt: TransactionReceipt) => { // Use TransactionReceipt type
          log("Transfer successful! Receipt received.", false, true);
          console.log("[TransferTest] Receipt:", receipt);
        })
        .on('error', (error: Error, receipt?: TransactionReceipt | undefined) => { // Corrected signature
          // `error` is of type Error (base class)
          // `receipt` is optional and of type TransactionReceipt (or undefined)
          log(`Transfer failed: ${error.message}`, true);
          console.error("[TransferTest] Full error object:", error);
          if (receipt) {
            console.error("[TransferTest] Accompanying receipt (if error occurred after mining):", receipt);
            // Check status on receipt: can be boolean (false), number (0), or hex string ('0x0')
            // In web3.js v4.x, receipt.status is typically bigint (0n or 1n) or boolean.
            if (!receipt.status || BigInt(receipt.status as any) === 0n) {
              log(`Transfer transaction mined but reverted. Status: ${receipt.status}`, true);
            }
          }
        })
        .catch((error: any) => { // Catch unhandled promise rejection from the PromiEvent itself
            log(`Unhandled promise rejection from sendTransaction: ${error.message}`, true);
            console.error("[TransferTest] Unhandled promise rejection:", error);
        });

      // Note: PromiEvent means the .send() call returns quickly. The listeners handle async results.
      // We might not want to setIsLoading(false) immediately here unless we await the PromiEvent.
      // For this test, we'll let the listeners update the logs. The isLoading state might need adjustment
      // if you want it to reflect the full transaction lifecycle.
      // For now, we'll assume the button becomes re-enabled after send is initiated.
      // Consider setting isLoading(false) inside .on('receipt') and .on('error') if you want to wait.

    } catch (e: any) {
      log(`Error in test transfer setup or pre-send: ${e.message}`, true);
      console.error("Test transfer setup error:", e);
      setIsLoading(false); // Ensure loading is false if setup fails
    }
    // setIsLoading(false); // Moved to finally or within listeners for better UX
  };


  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', border: '1px solid #eee', margin: '20px', borderRadius: '8px', color: "black" }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        Web3.js - Test Token Deployment (via MetaMask)
      </h3>
      <div style={{ marginBottom: '15px' }}>
        <span style={{ marginRight: '10px' }}>Target Network:</span>
        <button onClick={() => selectTargetNetwork('testnet')} style={{ marginRight: '5px', padding: '5px 10px', backgroundColor: activeNetworkConfig.id === 'testnet' ? '#007bff' : '#eee', color: activeNetworkConfig.id === 'testnet' ? 'white' : 'black' }}>Testnet</button>
        <button onClick={() => selectTargetNetwork('mainnet')} style={{ padding: '5px 10px', backgroundColor: activeNetworkConfig.id === 'mainnet' ? '#007bff' : '#eee', color: activeNetworkConfig.id === 'mainnet' ? 'white' : 'black' }}>Mainnet</button>
      </div>
      <button
        onClick={handleDeployTestToken}
        disabled={isLoading}
        style={{
          padding: '10px 20px', fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading ? '#ccc' : '#28a745',
          color: 'white', border: 'none', borderRadius: '5px',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? `Deploying to ${activeNetworkConfig.id}...` : `Connect & Deploy to ${activeNetworkConfig.id}`}
      </button>

     <button className='bg-orange-400' onClick={handleTestTransfer} disabled={isLoading}>
   {isLoading ? 'Deploying Simple Contract...' : 'Deploy Simple Greeter Contract'}
  </button>

      {deployedContractAddress && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid green', color: 'green', backgroundColor: '#e6ffed', borderRadius: '4px' }}>
          <strong>Deployment Successful!</strong>
          <p>Network: {activeNetworkConfig.chainName}</p>
          <p>Contract Address: 
            {activeNetworkConfig.blockExplorerUrls[0] && activeNetworkConfig.blockExplorerUrls[0] !== 'YOUR_GRAPHITE_TESTNET_EXPLORER_URL' && activeNetworkConfig.blockExplorerUrls[0] !== 'YOUR_GRAPHITE_MAINNET_EXPLORER_URL_PLACEHOLDER' ? (
              <a href={`${activeNetworkConfig.blockExplorerUrls[0]}/address/${deployedContractAddress}`} target="_blank" rel="noopener noreferrer" style={{color: 'green'}}>{deployedContractAddress}</a>
            ) : (
              <span>{deployedContractAddress}</span>
            )}
          </p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid red', color: 'red', backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '5px' }}>Error:</h4>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{error}</pre>
        </div>
      )}
      {logs.length > 0 && (
        <div style={{ marginTop: '15px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Deployment Log:</h4>
          <ul style={{ listStyleType: 'decimal', paddingLeft: '20px', margin: 0 }}>
            {logs.map((logMsg, index) => (
              <li key={index} style={{ padding: '4px 0', borderBottom: '1px dashed #eee', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: logMsg.toLowerCase().includes("error") || logMsg.toLowerCase().includes("fail") || logMsg.toLowerCase().includes("no accounts") ? 'red' : logMsg.toLowerCase().includes("success") ? 'green' : 'inherit' }}>
                {logMsg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}