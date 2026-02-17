"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";
import { MessageStatus } from "@/types/MessageType";
import { AnalyticsData } from "@/types/Analytics"; // use your AnalyticsData type
import { BroadcastReportRow } from "@/types/Broadcast";

type UseBroadcastMessageReportProps = {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  chatId: string;            // broadcast chatId
  messageId?: string;        // broadcast master message id (optional)
};

export function useBroadcastMessageReport({
  containerRef,
  chatId,
  messageId,
}: UseBroadcastMessageReportProps) {
  const [rows, setRows] = useState<BroadcastReportRow[]>([]);
  const [summary, setSummary] = useState<AnalyticsData>({
    totalMessages: 0,
    apiSentMessages: 0,
    fbAcceptedMessages: 0,
    deliveredMessages: 0,
    readMessages: 0,
  });
  const [perPage] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);

  // optional UI filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MessageStatus>("all");
  const [fbFilter, setFbFilter] = useState<"all" | "accepted" | "pending">("all");

  const fetchReport = useCallback(
    async (pageToFetch: number) => {
      if (!chatId) {
        setRows([]);
        setHasMore(false);
        return;
      }

      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const query = new URLSearchParams();
        query.set("chatId", chatId);
        query.set("page", String(pageToFetch));
        query.set("per_page", String(perPage));

        // optional master message id
        if (messageId) query.set("messageId", messageId);

        // optional filters
        if (search.trim()) query.set("q", search.trim());
        if (statusFilter !== "all") query.set("status", statusFilter);
        if (fbFilter !== "all") query.set("fb", fbFilter);

        const res = await fetch(
          `/api/wa-accounts/chats/broadcast/report?${query.toString()}`
        );

        const json: ApiResponse = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json?.message || "Failed to fetch report");
        }

        const reportRows: BroadcastReportRow[] = json.data?.rows || [];
        const reportSummary = json.data?.summary || {};

        setSummary((prev) => ({
          ...prev,
          ...reportSummary,
        }));

        setRows((prev) =>
          pageToFetch === 1 ? [...reportRows] : [...prev, ...reportRows]
        );

        const totalPages = json.pagination?.totalPages || 1;
        setHasMore(pageToFetch < totalPages);
      } catch (err: any) {
        toast.error(err.message || "Failed to load broadcast report");
      } finally {
        if (pageToFetch === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [chatId, messageId, perPage, search, statusFilter, fbFilter]
  );

  // fetch on init / refresh / filters / page
  useEffect(() => {
    fetchReport(page);
  }, [fetchReport, page, refreshFlag]);

  // reset when chatId or messageId changes
  useEffect(() => {
    setRows([]);
    setPage(1);
    setHasMore(true);
    fetchReport(1);
  }, [chatId, messageId, fetchReport]);

  // infinite scroll (optional)
  useEffect(() => {
    const container = containerRef?.current;
    if (!container)  return;

    const handleScroll = () => {
      const scrollBottom = container.scrollTop + container.clientHeight + 50;

      if (scrollBottom >= container.scrollHeight) {
        if (!loading && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => { container.removeEventListener("scroll", handleScroll) };
  }, [loading, loadingMore, hasMore]);

  const refreshReport = () => {
    setRows([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  // 🔹 If your backend does not support search/filter yet,
  // you can still filter client-side like this:
  const filteredRows = useMemo(() => {
    let list = [...rows];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.to?.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (fbFilter !== "all") {
      // fb accepted = sentAt exists
      if (fbFilter === "accepted") list = list.filter((r) => !!r.sentAt);
      if (fbFilter === "pending") list = list.filter((r) => !r.sentAt);
    }

    return list;
  }, [rows, search, statusFilter, fbFilter]);

  const searchMessages = (newQuery: string) => {
    setSearch(newQuery);
    setRows([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    // data
    rows: filteredRows,
    rawRows: rows,
    summary,

    // pagination states
    page,
    setPage,
    hasMore,
    loading,
    loadingMore,

    // filters
    searchMessages,
    statusFilter,
    setStatusFilter,
    fbFilter,
    setFbFilter,

    // actions
    refreshReport,
    setRows,
  };
}
