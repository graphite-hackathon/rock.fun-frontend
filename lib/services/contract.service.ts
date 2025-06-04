import Web3 from 'web3';
// If your ABI JSON directly exports the array and tsconfig has resolveJsonModule
import GemERC20Abi from '@lib/contracts/gem.abi.json' // Adjust path
import { GEM_ERC20_BYTECODE } from '@/lib/contracts/gem.bytecode';
import type { TransactionReceipt, Bytes } from 'web3-types';
import type { NetworkConfig } from '@config/network.config';

export interface DeployGemParams {
  tokenName: string;
  symbol: string;
  decimals: number;
  nominalTotalSupply: string;
}

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
}

async function deployContractLogic(
  web3: Web3,
  deployerAccount: string,
  params: DeployGemParams,
  networkConfig: NetworkConfig
): Promise<DeploymentResult> {
  const { tokenName, symbol, decimals, nominalTotalSupply } = params;

  const scaledTotalSupply = (BigInt(nominalTotalSupply) * (10n ** BigInt(decimals))).toString();
  const contract = new web3.eth.Contract(GemERC20Abi as any);
  const deployArguments = [tokenName, symbol.toUpperCase(), Number(decimals), scaledTotalSupply, deployerAccount];

  const gasEstimate = await contract.deploy({
    data: GEM_ERC20_BYTECODE,
    arguments: deployArguments,
  }).estimateGas({ from: deployerAccount });
  const gasLimit = (BigInt(gasEstimate) * 120n / 100n).toString();
  const gasPrice = await web3.eth.getGasPrice();

  return new Promise<DeploymentResult>((resolve, reject) => {
    let processedTxHashFromEvent: string | undefined;

    contract.deploy({
      data: GEM_ERC20_BYTECODE,
      arguments: deployArguments,
    })
    .send({
      from: deployerAccount,
      gas: gasLimit,
      gasPrice: gasPrice.toString(),
    })
    .on('transactionHash', (hashValue: string | Bytes | Uint8Array) => {
      let currentProcessedHash: string;
      if (typeof hashValue === 'string') {
        currentProcessedHash = hashValue;
      } else {
        currentProcessedHash = web3.utils.bytesToHex(hashValue as Uint8Array);
      }
      processedTxHashFromEvent = currentProcessedHash;
      console.log(`[ContractService] Deployment TxHash from event: ${processedTxHashFromEvent}`);
    })
    .on('receipt', (receipt: TransactionReceipt) => {
      let receiptTxHashString: string;
      if (typeof receipt.transactionHash === 'string') {
        receiptTxHashString = receipt.transactionHash;
      } else {
        receiptTxHashString = web3.utils.bytesToHex(receipt.transactionHash as Uint8Array);
      }

      const finalTxHash: string = processedTxHashFromEvent || receiptTxHashString;

      if (typeof finalTxHash !== 'string') {
         console.error("[ContractService] CRITICAL: finalTxHash is not a string in receipt handler!", finalTxHash);
         reject(new Error("Internal error: Could not determine a valid string for transaction hash."));
         return;
      }

      if (receipt.contractAddress) {
        console.log(`[ContractService] Contract deployed at ${receipt.contractAddress}`);
        resolve({ contractAddress: receipt.contractAddress, transactionHash: finalTxHash });
      } else {
        console.error("[ContractService] Deployment receipt received, but no contract address found.");
        reject(new Error("Deployment receipt missing contract address."));
      }
    })
    .on('error', (error: Error, receipt?: TransactionReceipt | undefined) => {
      console.error("[ContractService] Deployment error:", error);
      let errorTxHashString: string | undefined = processedTxHashFromEvent;

      if (!errorTxHashString && receipt?.transactionHash) {
        if (typeof receipt.transactionHash === 'string') {
          errorTxHashString = receipt.transactionHash;
        } else {
          errorTxHashString = web3.utils.bytesToHex(receipt.transactionHash as Uint8Array);
        }
      }

      if (receipt && (!receipt.status || BigInt(receipt.status as any) === 0n) ) {
        reject(new Error(`Transaction Mined but Reverted. Status: ${receipt.status}. TxHash: ${errorTxHashString || 'N/A'}`));
      } else if (errorTxHashString) {
        reject(new Error(`Transaction (Hash: ${errorTxHashString}) failed: ${error.message}`));
      } else {
        reject(error);
      }
    });
  });
}

interface DeployFunctionArgs {
    web3Instance: Web3;
    deployerAccount: string;
    params: DeployGemParams;
    activeNetworkConfig: NetworkConfig;
}

export async function deployGemWithMetaMask(
  args: DeployFunctionArgs
): Promise<DeploymentResult> {
  const { web3Instance, deployerAccount, params, activeNetworkConfig } = args;
  if (!web3Instance || !deployerAccount) {
    throw new Error("MetaMask Web3 instance or account not available for deployment.");
  }
  return deployContractLogic(web3Instance, deployerAccount, params, activeNetworkConfig);
}

export async function deployGemWithGraphiteWallet(
  args: DeployFunctionArgs
): Promise<DeploymentResult> {
  const { web3Instance, deployerAccount, params, activeNetworkConfig } = args;
  if (!web3Instance || !deployerAccount) {
    throw new Error("Graphite Wallet Web3 instance or account not available for deployment.");
  }
  return deployContractLogic(web3Instance, deployerAccount, params, activeNetworkConfig);
}