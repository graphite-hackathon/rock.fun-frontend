export interface IGem {
  _id?: string;
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creatorAddress: string;
  networkChainId: string;
  transactionHash: string;
  imageUrl?: string;
  createdAt?: string; // Dates are often strings in JSON
  updatedAt?: string;
}

export interface GraphiteProviderCustoms {
  enable: () => Promise<string[]>;
  isEnabled: () => Promise<boolean>;
  getBalance: () => Promise<string>;
  getAddress: () => Promise<string>;
  getAccountInfo: () => Promise<AccountInfo>;
  sendTx: (transaction: TransactionParameters) => Promise<string>;
  activateAccount: (address: string) => Promise<any>;
  updateKycLevel: (level: number) => Promise<any>;
  updateKycFilter: (filter: string) => Promise<any>;
  getLastKycRequest: () => Promise<any>;
  getActiveNetwork: () => Promise<ActiveNetworkInfo>;
  changeActiveNetwork: (network: NetworkParameters) => Promise<boolean>;
}

export interface CreateGemDto {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  creatorAddress: string;
  networkChainId: string;
  transactionHash: string;
  imageUrl?: string
}

export interface PaginatedGemsResponse {
  gems: IGem[];
  total: number;
  page: number;
  pages: number;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AccountInfo {
  balance: string; // Hex string (e.g., "0xf31021515242400")
  active: boolean;
  kycLevel: string;
  kycFilterLevel: string;
  reputation: string;
}

export interface TransactionParameters {
  to: string;
  value?: string;
  data?: string;
  gasPrice?: string;
  gasLimit?: string;
}

export interface NetworkParameters {
  chainId: string;
  rpcUrl: string;
  name?: string;
  ticker?: string;
}

export interface ActiveNetworkInfo {
  chainId: string;
  name: string;
  rpcUrl: string;
}
