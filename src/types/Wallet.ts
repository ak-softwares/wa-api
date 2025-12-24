export type Wallet = {
  _id?: string;
  userId: string;
  waAccountId: string;
  balance: number; // credits
  locked?: number; // optional (for in-flight usage)
}