import { Eip1193Provider as EthersEip1193Provider } from "ethers";

import {
  GraphiteProviderCustoms,
  NetworkParameters,
  ActiveNetworkInfo,
  TransactionParameters,
} from "../interface/gem.interface";

interface FullGraphiteProvider extends GraphiteProviderCustoms {
  request(args: {
    method: string;
    params?: Array<any> | Record<string, any>;
  }): Promise<any>;
  on?(eventName: string, listener: (...args: any[]) => void): this | undefined;
  removeListener?(
    eventName: string,
    listener: (...args: any[]) => void
  ): this | undefined;
}


  interface oldwindow {
    graphite?: FullGraphiteProvider;
    ethereum?: any;
    isMetaMask?: boolean; // Example property
    request: (args: { method: string; params?: Array<any> }) => Promise<any>;
    enable?: () => Promise<string[]>;
  }


export {};
