export interface Trades {
    date: string;
    account: string;
    type: "Buy" | "Sell";
    nDollar: string;
    miko: string;
    transactionId: string;
  }
  