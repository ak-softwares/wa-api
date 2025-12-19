import { Types } from "mongoose";

export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  balance: number; // credits
  locked?: number; // optional (for in-flight usage)
}

export type Wallet = IWallet;