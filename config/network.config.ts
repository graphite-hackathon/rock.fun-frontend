export interface NetworkConfig {
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
  kycApiUrl: string;
  kycApiKey: string | undefined;
}

export const GRAPHITE_MAINNET_CONFIG: NetworkConfig = {
  id: 'mainnet',
  chainIdHex: '0x6b6d1', // 440017
  chainIdDecimal: '440017',
  chainName: 'Graphite Mainnet',
  nativeCurrency: { name: 'Graphite', symbol: '@G', decimals: 18 },
  rpcUrls: ['https://anon-entrypoint-1.atgraphite.com'],
  blockExplorerUrls: [process.env.NEXT_PUBLIC_GRAPHITE_MAINNET_EXPLORER_URL || 'https://https://main.atgraphite.com/'],
  kycApiUrl: 'https://api.main.atgraphite.com/api',
  kycApiKey: process.env.NEXT_PUBLIC_GRAPHITE_MAIN_API_KEY,
};

export const GRAPHITE_TESTNET_CONFIG: NetworkConfig = {
  id: 'testnet',
  chainIdHex: '0xd39a',
  chainIdDecimal: '54170',
  chainName: 'Graphite Testnet',
  nativeCurrency: { name: 'Test Graphite', symbol: 't@G', decimals: 18 }, 
  rpcUrls: ['https://anon-entrypoint-test-1.atgraphite.com'],
  blockExplorerUrls: [process.env.NEXT_PUBLIC_GRAPHITE_TESTNET_EXPLORER_URL || 'https://test.atgraphite.com'], // From your image
  kycApiUrl: 'https://api.test.atgraphite.com/api',
  kycApiKey: process.env.NEXT_PUBLIC_GRAPHITE_TEST_API_KEY,
};


export const DEFAULT_TARGET_NETWORK_ID: 'mainnet' | 'testnet' = 'testnet';

export const getActiveNetworkConfig = (networkId: 'mainnet' | 'testnet' = DEFAULT_TARGET_NETWORK_ID): NetworkConfig => {
  return networkId === 'mainnet' ? GRAPHITE_MAINNET_CONFIG : GRAPHITE_TESTNET_CONFIG;
};