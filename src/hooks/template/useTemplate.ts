"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { ITemplate } from "@/types/template";

export function useTemplates() {
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [query, setQuery] = useState("");

  const fetchTemplates = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        // Build API URL with pagination and search
        const url = query
          ? `/api/whatsapp/template?q=${encodeURIComponent(query)}&page=${pageToFetch}&per_page=${perPage}`
          : `/api/whatsapp/template?page=${pageToFetch}&per_page=${perPage}`;

        const res = await fetch(url);
        const json: ApiResponse = await res.json();

        if (json.success && json.data) {
          // Update template list
          console.log(json.data);
          setTemplates((prev) => pageToFetch === 1 ? json.data : [...prev, ...json.data]
          );
          // Pagination logic
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
        } else {
          setTemplates([]);
          setHasMore(false);
        }
      } catch {
        toast.error("Failed to load templates.");
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [perPage, query]
  );

  // Load templates when page, query, or refresh flag changes
  useEffect(() => {
    fetchTemplates(page);
  }, [page, query, refreshFlag, fetchTemplates]);

  // Infinite scroll inside <main>
  useEffect(() => {
    const container = document.querySelector("main");
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
  }, [loading, loadingMore, hasMore]);

  const refreshTemplates = () => {
    setQuery("");
    setTemplates([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  const searchTemplates = (newQuery: string) => {
    setQuery(newQuery);
    setTemplates([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    templates,
    loading,
    loadingMore,
    hasMore,
    refreshTemplates,
    searchTemplates,
  };
}
