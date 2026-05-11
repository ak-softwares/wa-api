export const FREE_MONTHLY_MESSAGES = 1000;

export const PRICE_PER_CREDIT_USD = 0.002;

export const CURRENCY_CONFIG = {
  USD: { symbol: "$", name: "US Dollar" },
  INR: { symbol: "₹", name: "Indian Rupee" },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;