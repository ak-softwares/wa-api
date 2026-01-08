"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { Template } from "@/types/Template";

interface UseTemplatesProps {
  sidebarRef?: React.RefObject<HTMLDivElement | null>;
  isSend?: boolean;
}

export function useTemplates({ sidebarRef, isSend }: UseTemplatesProps = {}) {
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [after, setAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const PER_PAGE = "10";

  // -------------------------------
  // FETCH TEMPLATES
  // -------------------------------
  const fetchTemplates = useCallback(
    async (loadMore: boolean, cursor?: string | null) => {
      loadMore ? setLoadingMore(true) : setLoading(true);

      try {
        const url = new URL("/api/wa-accounts/templates", window.location.origin);
        url.searchParams.set("limit", PER_PAGE);
        if (loadMore && cursor) {
          url.searchParams.set("after", cursor);
        }

        const res = await fetch(url.toString());
        const json: ApiResponse<Template[]> = await res.json();

        if (!json.success || !json.data) {
          setHasMore(false);
          return;
        }

        let newTemplates = json.data;

        if (isSend) {
          newTemplates = newTemplates.filter(
            (t) => t.status === "APPROVED"
          );
        }

        setAllTemplates((prev) =>
          loadMore ? [...prev, ...newTemplates] : newTemplates
        );

        setTemplates((prev) =>
          loadMore ? [...prev, ...newTemplates] : newTemplates
        );

        const nextCursor = json.pagination?.cursors?.after ?? null;
        setAfter(nextCursor);
        setHasMore(Boolean(nextCursor));
      } catch {
        toast.error("Failed to load templates.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [isSend]
  );

  // Initial load
  useEffect(() => {
    fetchTemplates(false);
  }, [fetchTemplates]);

  // -------------------------------
  // INFINITE SCROLL (FIXED)
  // -------------------------------
  useEffect(() => {
    const container = sidebarRef?.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight + 50 >=
        container.scrollHeight
      ) {
        if (!loading && !loadingMore && hasMore) {
          fetchTemplates(true, after);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sidebarRef, loading, loadingMore, hasMore, after, fetchTemplates]);

  // -------------------------------
  // SEARCH
  // -------------------------------
  const searchTemplates = (value: string) => {

    if (!value.trim()) {
      setTemplates(allTemplates);
      return;
    }

    const q = value.toLowerCase();
    setTemplates(
      allTemplates.filter((t) =>
        t.name?.toLowerCase().includes(q)
      )
    );
  };

  // -------------------------------
  // REFRESH
  // -------------------------------
  const refreshTemplates = () => {
    setAfter(null);
    setHasMore(true);
    fetchTemplates(false);
  };

  return {
    templates,
    loading,
    loadingMore,
    hasMore,
    searchTemplates,
    refreshTemplates,
  };
}
