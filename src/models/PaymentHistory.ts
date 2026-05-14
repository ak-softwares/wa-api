import { Schema, model, models, Types } from 'mongoose';
import { PaymentStatus } from '@/types/PaymentHistory';
import { BillingCycle, Currency, PlanTier } from '@/types/Plans';

export interface IPaymentHistory {
  userId: Types.ObjectId;
  subscriptionId: string;
  planId: string;
  tier: Extract<PlanTier, 'STARTER' | 'GROWTH'>;
  billing: BillingCycle;
  currency: Currency;
  totalCount: number;
  quantity: number;
  status: PaymentStatus;
  shortUrl?: string;
  price: number;
}

const PaymentHistorySchema = new Schema<IPaymentHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: String, required: true, unique: true, index: true },
    planId: { type: String, required: true },
    tier: { type: String, enum: ['STARTER', 'GROWTH'], required: true },
    billing: { type: String, enum: ['MONTHLY', 'YEARLY'], required: true },
    currency: { type: String, enum: ['INR', 'USD'], required: true },
    totalCount: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      required: true,
      default: PaymentStatus.PENDING,
    },
    shortUrl: { type: String },
  },
  { timestamps: true }
);

export const PaymentHistoryModel =  models.PaymentHistory || model<IPaymentHistory>('PaymentHistory', PaymentHistorySchema);
