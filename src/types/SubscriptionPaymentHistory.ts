export enum SubscriptionPaymentStatus {
  PENDING = "pending",
  ACTIVE = "active",
  HALTED = "halted",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  FAILED = "failed",
  PAID = "paid",
}

export type SubscriptionPaymentHistory = {
  _id?: string;
  userId: string;
  subscriptionId: string;
  planId: string;
  tier: 'STARTER' | 'GROWTH';
  billing: 'MONTHLY' | 'YEARLY';
  currency: 'INR' | 'USD';
  totalCount: number;
  quantity: number;
  status: SubscriptionPaymentStatus;
  shortUrl?: string;
  createdAt?: string;
};
