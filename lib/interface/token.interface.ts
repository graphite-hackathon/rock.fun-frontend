import { Time } from "lightweight-charts";

export interface IToken {
  mint_address: string;
  name: string;
  symbol: string;
  uri: string;
  created_at: Date;

  // Optional fields to add later:
  created_by?: string;

  // image?: string;
  price_sol?: number;
  price_change_1h?: number;
  price_change_7h?: number;
  price_change_24h?: number;
  market_cap?: number;
  // volume_24h_sol?: number;
}

export interface ITokenMetadata extends IToken {
  image?: string;
  description?: string;
  [key: string]: any;
}

export interface IPrice {}

export interface IOhlcPrice {
  timestamp: string; // ISO date string from API
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface IPriceHistory {
  id: number;
  mint_address: string;
  timestamp: string; // or `Date` if you parse it
  price_scaled: string;
  price_per_full_token: number;
  current_supply_lamports: string;
}

export interface IChartData {
  time: Time; // UNIX timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ILineData {
  time: Time; // UNIX timestamp
 value: number
}
