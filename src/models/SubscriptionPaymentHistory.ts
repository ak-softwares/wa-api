import { Schema, model, models, Types } from 'mongoose';
import { SubscriptionPaymentStatus } from '@/types/SubscriptionPaymentHistory';
import { BillingCycle, Currency, PlanTier } from '@/types/Pricing';

export interface ISubscriptionPaymentHistory {
  userId: Types.ObjectId;
  subscriptionId: string;
  planId: string;
  tier: Extract<PlanTier, 'STARTER' | 'GROWTH'>;
  billing: BillingCycle;
  currency: Currency;
  totalCount: number;
  quantity: number;
  status: SubscriptionPaymentStatus;
  shortUrl?: string;
}

const SubscriptionPaymentHistorySchema = new Schema<ISubscriptionPaymentHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: String, required: true, index: true },
    planId: { type: String, required: true },
    tier: { type: String, enum: ['STARTER', 'GROWTH'], required: true },
    billing: { type: String, enum: ['MONTHLY', 'YEARLY'], required: true },
    currency: { type: String, enum: ['INR', 'USD'], required: true },
    totalCount: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      enum: Object.values(SubscriptionPaymentStatus),
      required: true,
      default: SubscriptionPaymentStatus.PENDING,
    },
    shortUrl: { type: String },
  },
  { timestamps: true }
);

export const SubscriptionPaymentHistoryModel =
  models.SubscriptionPaymentHistory ||
  model<ISubscriptionPaymentHistory>('SubscriptionPaymentHistory', SubscriptionPaymentHistorySchema);
