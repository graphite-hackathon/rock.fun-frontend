/**
 * This file outlines the functions available from the Graphite Wallet provider (`window.graphite`),
 * based on the documentation at:
 * https://docs.atgraphite.com/ecosystem/graphite-wallet/graphite-web3-documentation
 *
 * Function names are converted to camelCase for common TypeScript usage.
 * These would typically be accessed via the `window.graphite` object.
 */

// --- START: TypeScript Type Augmentation for window.graphite ---
import { Eip1193Provider } from 'ethers'; // Assuming ethers is installed and Eip1193Provider is accessible
import { GraphiteProviderCustoms, NetworkParameters, ActiveNetworkInfo, TransactionParameters } from '../interface/gem.interface';



// Combine with EIP-1193 Provider methods if they are mixed
type FullGraphiteProvider = Eip1193Provider & GraphiteProviderCustoms;




// ... (rest of the functions: enable, isEnabled, getBalance, etc.)

/**
 * Requests user authorization for the dApp to access their wallet.
 * Typically called when the user initiates a "connect wallet" action.
 * @returns A Promise that resolves with an array of account addresses.
 */
async function enable(): Promise<string[]> {
  if (window.graphite) {
    return window.graphite.enable();
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Checks if the dApp is already authorized (connected) to the user's wallet.
 * @returns A Promise that resolves with a boolean indicating connection status.
 */
async function isEnabled(): Promise<boolean> {
  if (window.graphite) {
    return window.graphite.isEnabled();
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Retrieves the balance of the currently active account in the wallet.
 * @returns A Promise that resolves with the balance as a string (likely in wei).
 */
async function getBalance(): Promise<string> {
  if (window.graphite) {
    return window.graphite.getBalance();
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Retrieves the address of the currently active account in the wallet.
 * @returns A Promise that resolves with the account address as a string.
 */
async function getAddress(): Promise<string> {
  if (window.graphite) {
    return window.graphite.getAddress();
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Sends a transaction to the Graphite network.
 * @param params - The transaction parameters.
 * @returns A Promise that resolves with the transaction hash as a string.
 */
async function sendTx(params: TransactionParameters): Promise<string> {
  if (window.graphite) {
    return window.graphite.sendTx(params);
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Activates a specified account.
 * @param address - The address of the account to activate.
 * @returns A Promise that resolves with the result of the activation.
 */
async function activateAccount(address: string): Promise<any> {
  if (window.graphite) {
    return window.graphite.activateAccount(address);
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Updates the KYC (Know Your Customer) level for the user.
 * @param level - The KYC level to set.
 * @returns A Promise that resolves with the result of the update.
 */
async function updateKycLevel(level: number): Promise<any> {
  if (window.graphite) {
    return window.graphite.updateKycLevel(level);
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Updates the KYC filter for the user.
 * @param filter - The KYC filter string.
 * @returns A Promise that resolves with the result of the update.
 */
async function updateKycFilter(filter: string): Promise<any> {
  if (window.graphite) {
    return window.graphite.updateKycFilter(filter);
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Retrieves the latest KYC request data for the user.
 * @returns A Promise that resolves with the KYC request data.
 */
async function getLastKycRequest(): Promise<any> {
  if (window.graphite) {
    return window.graphite.getLastKycRequest();
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Retrieves information about the currently active network in the wallet.
 * @returns A Promise that resolves with an object containing chainId, name, and rpcUrl.
 */
async function getActiveNetwork(): Promise<ActiveNetworkInfo | string> {
  if (window.graphite) {
    return window.graphite.getActiveNetwork();
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * Requests the wallet to switch to a different network.
 * @param network - An object specifying the target network's chainId, rpcUrl, and optionally name and ticker.
 * @returns A Promise that resolves with a boolean indicating if the network switch was successful.
 */
async function changeActiveNetwork(network: NetworkParameters): Promise<boolean> {
  if (window.graphite) {
    return window.graphite.changeActiveNetwork(network);
  }
  throw new Error('Graphite Wallet not found.');
}

/**
 * A generic method to make JSON-RPC requests to the Graphite node, as per EIP-1193.
 * @param args - An object with `method` (the RPC method name) and optional `params` (array of parameters).
 * @returns A Promise that resolves with the result of the RPC call.
 */
async function request(args: { method: string; params?: Array<any> }): Promise<any> {
  if (window.graphite && window.graphite.request) { // Ensure request method exists
    return window.graphite.request(args);
  }
  throw new Error('Graphite Wallet not found or request method not available.');
}

export {
  enable,
  isEnabled,
  getBalance,
  getAddress,
  sendTx,
  activateAccount,
  updateKycLevel,
  updateKycFilter,
  getLastKycRequest,
  getActiveNetwork,
  changeActiveNetwork,
  request,
  type TransactionParameters, // Export types if they are used by consumers of this module
  type NetworkParameters,
  type ActiveNetworkInfo,
  type FullGraphiteProvider
};