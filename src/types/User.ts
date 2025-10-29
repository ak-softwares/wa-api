import mongoose from "mongoose";
import { IWaAccount } from "./WaAccount";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: number;
  company?: string;
  password: string;
  apiToken?: string;
  waAccounts?: IWaAccount[];
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type User = IUser;