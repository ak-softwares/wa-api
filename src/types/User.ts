import mongoose, { Types } from "mongoose";

export type User = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: number;
  company?: string;
  password: string;
  defaultWaAccountId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}