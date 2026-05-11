import { Schema, model, models, Types } from 'mongoose';
import { BillingCycle, Currency, PlanTier } from '@/types/Pricing';

export enum SubscriptionStatus {
  CREATED = 'created',
  AUTHENTICATED = 'authenticated',
  ACTIVE = 'active',
  HALTED = 'halted',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface IUserSubscription {
  userId: Types.ObjectId;
  subscriptionId: string;
  planId: string;
  tier: Extract<PlanTier, 'STARTER' | 'GROWTH'>;
  billing: BillingCycle;
  currency: Currency;
  status: SubscriptionStatus;
  currentStart?: Date;
  currentEnd?: Date;
  totalCount: number;
  paidCount: number;
  remainingCount: number;
  shortUrl?: string;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscriptionId: { type: String, required: true, unique: true, index: true },
    planId: { type: String, required: true },
    tier: { type: String, enum: ['STARTER', 'GROWTH'], required: true },
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
  },
  { timestamps: true }
);

export const UserSubscriptionModel =
  models.UserSubscription ||
  model<IUserSubscription>('UserSubscription', UserSubscriptionSchema);
