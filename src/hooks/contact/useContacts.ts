"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { IContact } from "@/types/contact";
import { toast } from "@/components/ui/sonner";

export function useContacts() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [query, setQuery] = useState("");

  const fetchContacts = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(
          query
            ? `/api/contacts?q=${encodeURIComponent(query)}&page=${pageToFetch}&per_page=${perPage}`
            : `/api/contacts?page=${pageToFetch}&per_page=${perPage}`
        );
        const json: ApiResponse = await res.json();

        if (json.success && json.data) {
          setContacts((prev) => pageToFetch === 1 ? json.data : [...prev, ...json.data]);
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
        } else {
          setContacts([]);
          setHasMore(false);
        }
      } catch {
        toast.error("Failed to load contacts.");
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [perPage, query]
  );

  useEffect(() => {
    fetchContacts(page);
  }, [page, query, refreshFlag, fetchContacts]);

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

  const refreshContacts = () => {
    setQuery("");
    setContacts([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  const searchContacts = (newQuery: string) => {
    setQuery(newQuery);
    setContacts([]);
    setPage(1);
    setHasMore(true);
  };

  return { contacts, loading, loadingMore, hasMore, refreshContacts, searchContacts };
}
