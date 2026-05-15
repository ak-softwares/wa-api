// hooks/subscription/SubscriptionUsageContext.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSubscriptionUsage } from "@/hooks/subscription/useSubscriptionUsage";

type CtxValue = ReturnType<typeof useSubscriptionUsage>;

const Ctx = createContext<CtxValue | null>(null);

export function SubscriptionUsageProvider({ children }: { children: ReactNode }) {
  const value = useSubscriptionUsage();          // called exactly once
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscriptionUsageCtx(): CtxValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSubscriptionUsageCtx must be inside SubscriptionUsageProvider");
  return ctx;
}