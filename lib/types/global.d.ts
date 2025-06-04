import { Eip1193Provider as EthersEip1193Provider } from "ethers";

import {
  GraphiteProviderCustoms,
  NetworkParameters,
  ActiveNetworkInfo,
  TransactionParameters,
} from "../interface/gem.interface";


interface ActiveNetworkInfo { chainId: string; name: string; rpcUrl: string; }
interface AccountInfo { balance: string; active: boolean; kycLevel: string; kycFilterLevel: string; reputation: string; }
interface NetworkParameters { chainId: string; rpcUrl: string; name?: string; ticker?: string; }

interface GraphiteProviderEIP1193 extends GraphiteProviderCustoms {
  request(args: { method: string; params?: Array<any> | Record<string, any> }): Promise<any>;
  on(eventName: string, listener: (...args: any[]) => void): this | undefined;
  removeListener?(eventName: string, listener: (...args: any[]) => void): this | undefined;
  enable: () => Promise<string[]>; // Specific to some wallets like Graphite's
  // Standard methods that might be on the provider directly or through request
  getAddress: () => Promise<string>; // Graphite custom
  getBalance: () => Promise<string>; // Graphite custom
  getActiveNetwork: () => Promise<ActiveNetworkInfo | string>; // Graphite custom
  getAccountInfo: () => Promise<AccountInfo>; // Graphite custom
  changeActiveNetwork: (network: NetworkParameters) => Promise<boolean>; // Graphite custom
  isEnabled: () => Promise<boolean>; // Graphite custom
}

declare global {
  interface Window {
    ethereum?: any; // MetaMask often implements more than just request
    graphite?: GraphiteProviderEIP1193; // Assuming Graphite Wallet also implements these
  }
}

export {};
