import { Schema, model, models, Types } from 'mongoose';
import { BillingCycle, Currency, PlanTier } from '@/types/Plans';

export enum SubscriptionStatus {
  CREATED = 'created',
  AUTHENTICATED = 'authenticated',
  ACTIVE = 'active',
  HALTED = 'halted',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface ISubscription {
  userId: Types.ObjectId;
  subscriptionId: string;
  planId: string;
  tier: Extract<PlanTier, 'FREE' | 'STARTER' | 'GROWTH'>;
  billing: BillingCycle;
  currency: Currency;
  status: SubscriptionStatus;
  currentStart?: Date;
  currentEnd?: Date;
  totalCount: number;
  paidCount: number;
  remainingCount: number;
  shortUrl?: string;
  price: number;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: String, required: true, unique: true, index: true },
    planId: { type: String, required: true },
    tier: { type: String, enum: ['FREE', 'STARTER', 'GROWTH'], required: true },
    billing: { type: String, enum: ['MONTHLY', 'YEARLY'], required: true },
    currency: { type: String, enum: ['INR', 'USD'], required: true },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.CREATED,
    },
    currentStart: { type: Date },
    currentEnd: { type: Date },
    totalCount: { type: Number, required: true },
    paidCount: { type: Number, default: 0 },
    remainingCount: { type: Number, default: 0 },
    shortUrl: { type: String },
    price: { type: Number },
  },
  { timestamps: true }
);

export const SubscriptionModel = models.Subscription || model<ISubscription>('Subscription', SubscriptionSchema);
