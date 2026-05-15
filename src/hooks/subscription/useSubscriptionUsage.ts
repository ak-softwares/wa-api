"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiResponse } from "@/types/apiResponse";
import { SubscriptionUsageResponse } from "@/types/SubscriptionUsage";

export function useSubscriptionUsage() {
  const [data, setData] = useState<SubscriptionUsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionUsage = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/subscription/usage");
      const json: ApiResponse<SubscriptionUsageResponse> = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(json.message || "Failed to fetch subscription usage");
      }

      setData(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch subscription usage");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionUsage();
  }, [fetchSubscriptionUsage]);

  return {
    data,
    loading,
    error,
    refetch: fetchSubscriptionUsage,
  };
}
