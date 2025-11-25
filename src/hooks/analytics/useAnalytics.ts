"use client";

import { AnalyticsData } from "@/types/Analytics";
import { useState, useCallback } from "react";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async (range: { start: Date; end: Date }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(range),
      });

      const result = await res.json();
      setData(result.data);
    } finally {
      setLoading(false);
    }
  }, []); // 👈 Memoized once

  return { data, loading, fetchAnalytics };
}
