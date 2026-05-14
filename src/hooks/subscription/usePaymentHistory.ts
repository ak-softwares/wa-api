"use client";

import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";
import {
  PaymentHistory,
  PaymentStatus,
} from "@/types/PaymentHistory";

interface UsePaymentHistoryProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function usePaymentHistory({
  containerRef,
}: UsePaymentHistoryProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [status, setStatus] = useState<PaymentStatus | "">("");

  const fetchPaymentHistory = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: pageToFetch.toString(),
          per_page: perPage.toString(),
        });

        if (status) params.append("status", status);

        const res = await fetch(`/api/subscription/payment-history?${params.toString()}`);
        const json: ApiResponse = await res.json();

        if (json.success && json.data) {
          setPaymentHistory((prev) =>
            pageToFetch === 1 ? json.data : [...prev, ...json.data]
          );
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
          setTotalRecords(json.pagination?.total || 0);
        } else {
          setPaymentHistory([]);
          setHasMore(false);
        }
      } catch {
        showToast.error("Failed to load subscription payment history.");
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [perPage, status]
  );

  useEffect(() => {
    fetchPaymentHistory(page);
  }, [page, status, refreshFlag, fetchPaymentHistory]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight + 50 >= container.scrollHeight) {
        if (!loading && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, loading, loadingMore, hasMore]);

  const refreshPaymentHistory = () => {
    setPaymentHistory([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((flag) => flag + 1);
  };

  const filterByStatus = (nextStatus: PaymentStatus | "") => {
    setStatus(nextStatus);
    setPaymentHistory([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    paymentHistory,
    loading,
    loadingMore,
    hasMore,
    totalRecords,
    refreshPaymentHistory,
    filterByStatus,
  };
}
