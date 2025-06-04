import { ethers, Signer, ContractFactory, BaseContract } from 'ethers';
import gemERC20AbiJson from '@lib/contracts/gem.abi.json'; // Adjust path as needed
import { GEM_ERC20_BYTECODE } from '@lib/contracts/gem.bytecode';
import { InterfaceAbi } from 'ethers';


interface DeployGemParams {
  signer: Signer; // From connected wallet
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string; // Nominal supply, e.g., "1000000"
  decimals: number; // e.g., 18
}

interface DeployResult {
  contractAddress: string;
  transactionHash: string;
}

const GemERC20Abi: InterfaceAbi = gemERC20AbiJson as InterfaceAbi;

export async function deployGemContract(
  params: DeployGemParams
): Promise<DeployResult> {
  const { signer, tokenName, tokenSymbol, totalSupply, decimals } = params;

  if (!signer) {
    throw new Error("Wallet not connected or signer not available.");
  }

  const factory = new ethers.ContractFactory(GemERC20Abi, GEM_ERC20_BYTECODE, signer);

  try {
    // Ensure totalSupply is a BigInt for accurate large number math
    // User provides "1000000", we convert to "1000000" + `decimals` zeros
    const scaledTotalSupply = ethers.parseUnits(totalSupply, decimals);

    console.log(`Deploying GemERC20 with params:
      Name: ${tokenName}
      Symbol: ${tokenSymbol}
      Decimals: ${decimals}
      Scaled Initial Supply: ${scaledTotalSupply.toString()}
      Deployer/Initial Holder: ${await signer.getAddress()}
    `);

    const contract = await factory.deploy(
      tokenName,
      tokenSymbol,
      decimals,
      scaledTotalSupply,
      await signer.getAddress() // The deployer will be the initial holder and owner
    );

    console.log("Contract deployment transaction sent:", contract.deploymentTransaction()?.hash);
    await contract.waitForDeployment(); // Waits for the contract to be mined and deployed
    
    const contractAddress = await contract.getAddress();
    console.log("GemERC20 deployed to:", contractAddress);

    return {
      contractAddress: contractAddress,
      transactionHash: contract.deploymentTransaction()?.hash || '',
    };
  } catch (error: any) {
    console.error("Error deploying Gem contract:", error);
    // Attempt to parse more specific revert reasons if available
    if (error.data) {
      const decodedError = new ethers.Interface(GemERC20Abi).parseError(error.data);
      if (decodedError) {
         throw new Error(`Contract deployment failed: ${decodedError.name} - ${decodedError.args.join(', ')}`);
      }
    }
    if (error.message) {
        throw new Error(`Contract deployment failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during contract deployment.");
  }
}