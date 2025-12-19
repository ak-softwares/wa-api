import { IWallet } from "@/types/Wallet";
import mongoose, { Schema, models, model } from "mongoose";

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccount", required: true },
    balance: { type: Number, default: 0, min: 0 },
    locked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Wallet = models.Wallet || model<IWallet>("Wallet", WalletSchema);
