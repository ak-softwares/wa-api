import { useCallback, useEffect, useState } from "react";
import { ToolCatalog } from "@/types/Tool";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";
import { ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";

export function useTools() {
  const [tools, setTools] = useState<ToolCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTools = useCallback(async (pageToFetch: number) => {
    try {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(`/api/ai/tools?page=${pageToFetch}&per_page=${ITEMS_PER_PAGE}`, {
        method: "GET",
      });

      const json: ApiResponse = await res.json();

      if (!res.ok || !json.success) {
        showToast.error(json.message || "Failed to fetch tools");
        if (pageToFetch === 1) setTools([]);
        return;
      }

      const nextTools = json.data?.tools || [];

      setTools((prev) => (pageToFetch === 1 ? nextTools : [...prev, ...nextTools]));

      const totalPages = json.data?.pagination?.total_pages || 1;
      setHasMore(pageToFetch < totalPages);
    } catch (err: any) {
      showToast.error(err.message || "Something went wrong");
      if (pageToFetch === 1) setTools([]);
    } finally {
      if (pageToFetch === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchTools(page);
  }, [fetchTools, page]);

  const refresh = () => {
    if (page === 1) {
      fetchTools(1);
      return;
    }

    setPage(1);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setPage((prev) => prev + 1);
  };

  return {
    tools,
    setTools,
    loading,
    loadingMore,
    hasMore,
    page,
    loadMore,
    refresh,
  };
}