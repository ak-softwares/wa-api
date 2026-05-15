// models/SubscriptionUsage.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriptionUsage extends Document {
  userId:       mongoose.Types.ObjectId;
  periodStart:  Date;
  periodEnd:    Date;
  messagesUsed: number;
  messageLimit: number;
  tier:         string;
}

const SubscriptionUsageSchema = new Schema<ISubscriptionUsage>(
  {
    userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
    periodStart:  { type: Date, required: true },
    periodEnd:    { type: Date, required: true },
    messagesUsed: { type: Number, default: 0 },
    messageLimit: { type: Number, required: true },
    tier:         { type: String, required: true },
  },
  { timestamps: true },
);

// Fast lookups by user + active period
SubscriptionUsageSchema.index({ userId: 1, periodEnd: 1 });

export const SubscriptionUsageModel =
  mongoose.models.SubscriptionUsage ||
  mongoose.model<ISubscriptionUsage>('SubscriptionUsage', SubscriptionUsageSchema);