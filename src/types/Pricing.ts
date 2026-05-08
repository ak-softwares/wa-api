export type Currency = "USD" | "EUR" | "GBP" | "INR";

export type BillingCycle = "monthly" | "yearly";

export type PricingPlan = {
  id: "free" | "starter" | "growth" | "pro" | "enterprise";
  name: string;
  monthlyUSD: number | null;
  messages: number | null;
  messagesLabel: string;
  description: string;
  cta: string;
  highlighted: boolean;
  badge: string | null;
};

export type CurrencyConfig = {
  symbol: string;
  name: string;
  rate: number;
};

export type PricingFeature = {
  icon: string;
  label: string;
};

export type PricingFeatureDetail = {
  icon: string;
  title: string;
  desc: string;
};

export type PricingFaq = {
  q: string;
  a: string;
};

export type PricingPageData = {
  plans: PricingPlan[];
  currencies: Record<Currency, CurrencyConfig>;
  supportedCurrencies: Currency[];
  yearlyDiscount: number;
  allFeatures: PricingFeature[];
  featureBreakdown: PricingFeatureDetail[];
  faqs: PricingFaq[];
  metaPricingUrl: string;
};
