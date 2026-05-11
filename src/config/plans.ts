import { Plans } from "@/types/Plans";

export const PLAN_CONFIG: Plans = {
  FREE: {
    name: "Free",
    messagesPerMonth: 100,
    monthlyPrice: { INR: 0, USD: 0 },
    yearlyPrice:  { INR: 0, USD: 0 },
    features: ["100 messages/month", "1 WhatsApp number"],
    description: "Try it out, no strings attached",
    cta: "Get Started Free",
    highlighted: false,
    badge: null,
  },
  STARTER: {
    name: "Starter",
    messagesPerMonth: 5000,
    monthlyPrice: { INR: 1499,  USD: 19 },
    yearlyPrice:  { INR: 14999, USD: 199 },
    features: ["5000 messages/month", "1 WhatsApp number"],
    description: "Perfect for solo founders and small teams",
    cta: "Start Now",
    highlighted: false,
    badge: null,
  },
  GROWTH: {
    name: "Growth",
    messagesPerMonth: 10000,
    monthlyPrice: { INR: 2999, USD: 39 },
    yearlyPrice:  { INR: 29999, USD: 399 },
    features: ["10000 messages/month", "3 WhatsApp numbers"],
    description: "For power users with high engagement",
    cta: "Get Growth",
    highlighted: true,
    badge: "Most Popular ⭐",
  },
  ENTERPRISE: {
    name: "Enterprise",
    messagesPerMonth: -1,
    monthlyPrice: null,
    yearlyPrice:  null,
    features: ["Unlimited messages/month", "Unlimited WhatsApp numbers"],
    description: "For large organizations with complex needs",
    cta: "Contact Sales",
    highlighted: false,
    badge: null,
  },
} as const;

export type PlanTier = keyof typeof PLAN_CONFIG;  // 'FREE' | 'STARTER' | 'GROWTH' | 'ENTERPRISE'

export const BILLING_CYCLE_CONFIG = {
  MONTHLY: { label: "Monthly", totalCount: 36 },
  YEARLY:  { label: "Yearly",  totalCount: 3  },
} as const;