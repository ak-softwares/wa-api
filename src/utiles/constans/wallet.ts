import { randomBytes } from "crypto";

export const FREE_MONTHLY_MESSAGES = 1000;

export const PRICE_PER_CREDIT_USD = 0.002;

export const CURRENCY_CONFIG = {
  USD: { symbol: "$", name: "US Dollar", rate: 1 },
  INR: { symbol: "₹", name: "Indian Rupee", rate: 83 },
  EUR: { symbol: "€", name: "Euro", rate: 0.85 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.75 },
} as const;

export type CurrencyCode = keyof typeof CURRENCY_CONFIG;