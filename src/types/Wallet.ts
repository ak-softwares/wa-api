export type Wallet = {
  _id?: string;
  userId: string;
  balance: number; // credits
  locked?: number; // optional (for in-flight usage)
}

export type WalletAnalytics = {
  creditBalance: number;
  lockedCredits: number;
  currentMonthUsed: number;
  year: number;
  month: number;
}
