"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { IContact } from "@/types/contact";
import { toast } from "@/components/ui/sonner";

export function useContacts() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);       // 🔹 initial load / refresh
  const [loadingMore, setLoadingMore] = useState(false); // 🔹 infinite scroll load
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0); // 👈 force re-run

const fetchContacts = useCallback(
  async (pageToFetch: number) => {
    if (pageToFetch === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await fetch(`/api/contacts?page=${pageToFetch}&per_page=${perPage}`);
      const json: ApiResponse = await res.json();

      if (json.success && json.data) {
        setContacts((prev) =>
          pageToFetch === 1 ? json.data : [...prev, ...json.data]
        );
        setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
      }
    } catch (err) {
      toast.error("Failed to load contacts.");
    } finally {
      if (pageToFetch === 1) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  },
  [perPage] // 🔹 only real dependency
);


  // ✅ Run fetch when page changes OR when refreshFlag changes
  useEffect(() => {
    fetchContacts(page);
  }, [page, refreshFlag, fetchContacts]);

  // ✅ Infinite scroll listener on <main>
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

  // ✅ Force reload (reset to page 1)
  const refreshContacts = () => {
    setContacts([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  return { contacts, loading, loadingMore, hasMore, refreshContacts };
}
