export const FREE_MONTHLY_MESSAGES = 1000;

export const PRICE_PER_CREDIT_USD = 0.002;

export const CURRENCY_CONFIG = {
  USD: { rate: 1, symbol: "$", name: "US Dollar" },
  EUR: { rate: 1.07, symbol: "€", name: "Euro" },
  INR: { rate: 0.012, symbol: "₹", name: "Indian Rupee" },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;