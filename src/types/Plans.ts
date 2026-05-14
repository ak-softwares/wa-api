export const BILLING_CYCLES = ['MONTHLY', 'YEARLY'] as const;
export type BillingCycle = typeof BILLING_CYCLES[number];

export const CURRENCIES = ['INR', 'USD'] as const;
export type Currency = typeof CURRENCIES[number]; // "INR" | "USD"

export interface PriceMap {
  INR: number;
  USD: number;
}

export interface PlanConfig {
  name: string;
  messagesPerMonth: number;
  monthlyPrice: PriceMap | null;
  yearlyPrice: PriceMap | null;
  features: string[];
  description: string;
  cta: string;
  highlighted: boolean;
  badge: string | null;
}

export type PlanTier =
  | "FREE"
  | "STARTER"
  | "GROWTH"
  | "ENTERPRISE";

export type Plans = Record<PlanTier, PlanConfig>;