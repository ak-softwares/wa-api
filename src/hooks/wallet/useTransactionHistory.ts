"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";
import { WalletTransactionType } from "@/types/WalletTransaction";
import { WalletTransaction } from "@/types/WalletTransaction";

interface UseTransactionHistoryProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function useTransactionHistory({
  containerRef,
}: UseTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [refreshFlag, setRefreshFlag] = useState(0);

  // Filters
  const [type, setType] = useState<WalletTransactionType | "">("");

  const fetchTransactions = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const params = new URLSearchParams({
          page: pageToFetch.toString(),
          per_page: perPage.toString(),
        });

        if (type) params.append("type", type);

        const res = await fetch(`/api/wallet/transactions?${params.toString()}`);
        const json: ApiResponse = await res.json();

        if (json.success && json.data) {
          setTransactions((prev) =>
            pageToFetch === 1 ? json.data : [...prev, ...json.data]
          );

          setHasMore(
            pageToFetch < (json.pagination?.totalPages || 1)
          );

          setTotalTransactions(json.pagination?.total || 0);
        } else {
          setTransactions([]);
          setHasMore(false);
        }
      } catch {
        showToast.error("Failed to load transaction history.");
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [perPage, type]
  );

  useEffect(() => {
    fetchTransactions(page);
  }, [page, type, refreshFlag, fetchTransactions]);

  // Infinite scroll
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

  const refreshTransactions = () => {
    setTransactions([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  const filterByType = (newType: WalletTransactionType | "") => {
    setType(newType);
    setTransactions([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    transactions,
    setTransactions,
    loading,
    loadingMore,
    hasMore,
    totalTransactions,
    refreshTransactions,
    filterByType,
    containerRef,
  };
}
