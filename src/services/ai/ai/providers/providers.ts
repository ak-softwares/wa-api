import { AIProvider } from "@/types/Ai";

export const AI_PROVIDERS = {
  GPT_4O_MINI: {
    id: "gpt-4o-mini",
    inputPrice: 0.150,   // $ per 1M tokens
    outputPrice: 0.600,  // $ per 1M tokens
  },
} as const;

export type ProviderKey = keyof typeof AI_PROVIDERS;