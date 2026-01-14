export type Wallet = {
  _id?: string;
  userId: string;
  balance: number; // credits
}

export type WalletAnalytics = {
  creditBalance: number;
  currentMonthUsed: number;
  year: number;
  month: number;
}
