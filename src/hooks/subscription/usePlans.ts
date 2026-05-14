"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BillingCycle,
  Currency,
  PlanTier,
  Plans,
} from "@/types/Plans"
import { ApiResponse } from "@/types/apiResponse";

interface UsePricingOptions {
  defaultCurrency?: Currency;
  defaultBillingCycle?: BillingCycle;
}

export function usePricing({defaultCurrency = "INR", defaultBillingCycle = "MONTHLY"}: UsePricingOptions = {}) {
  const [plans, setPlans] = useState<Plans | null>(null);
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(defaultBillingCycle);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/subscription/plans");
        const json: ApiResponse<Plans> = await res.json();
        if (json.success && json.data) {
          setPlans(json.data);
        }
      } catch (error) {
        // console.error("Failed to fetch plans", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formattedPlans = useMemo(() => {
    if (!plans) return [];

    return Object.entries(plans).map(([tier, plan]) => {
      const price =
        billingCycle === "MONTHLY"
          ? plan.monthlyPrice?.[currency]
          : plan.yearlyPrice?.[currency] != null
            ? Math.round(plan.yearlyPrice[currency]! / 12)
            : undefined;

      return {
        tier: tier as PlanTier,
        ...plan,
        price,
        currency,
        billingCycle,
      };
    });
  }, [plans, currency, billingCycle]);

  return {
    plans: formattedPlans,
    rawPlans: plans,

    currency,
    setCurrency,

    billingCycle,
    setBillingCycle,

    loading,
  };
}