import { BillingCycle, Currency, PlanTier } from "@/types/Plans";

export type SubscriptionUsage = {
  tier: PlanTier;
  planName: string;
  status: string;
  billing: BillingCycle | null;
  currency: Currency | null;
  subscriptionId: string | null;
  renewsAt: string | null;
  currentPeriodStart: string | null;
  messageLimit: number;
  usedMessages: number;
  remainingMessages: number | null;
  usagePercent: number;
  isUnlimited: boolean;
  year: number;
  month: number;
};
