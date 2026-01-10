import mongoose, { Schema, models, model, Types } from "mongoose";

export interface IWallet {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number; // credits
  locked?: number; // optional (for in-flight usage)
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    locked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const WalletModel = models.Wallet || model<IWallet>("Wallet", WalletSchema);
