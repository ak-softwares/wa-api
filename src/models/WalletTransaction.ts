import { PaymentStatus, WalletTransactionType } from "@/types/WalletTransaction";
import { Schema, model, models, Types } from "mongoose";

export interface IWalletTransaction {
  userId: Types.ObjectId;
  type: WalletTransactionType;
  currency: string;
  amount: number;
  credits: number;
  creditsBefore: number;
  creditsAfter: number;
  orderId?: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(WalletTransactionType), required: true },
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
    credits: { type: Number, required: true },
    creditsBefore: { type: Number, required: true },
    creditsAfter: { type: Number, required: true },
    orderId: { type: String },
    paymentId: { type: String },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, required: true },
  },
  { timestamps: true }
);

export const WalletTransactionModel = models.WalletTransaction || 
    model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema);
