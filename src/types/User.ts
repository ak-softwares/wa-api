import mongoose, { Types } from "mongoose";

export interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: number;
  company?: string;
  password: string;
  apiToken?: string;
  apiTokenHashed?: string;
  defaultWaAccountId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type User = IUser;