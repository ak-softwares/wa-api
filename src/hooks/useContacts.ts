"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { IContact } from "@/types/contact";

export function useContacts() {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0); // 👈 force re-run

  const fetchContacts = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/contacts?page=${page}&per_page=${perPage}`);
      const json: ApiResponse = await res.json();

      if (json.success && json.data) {
        setContacts((prev) =>
          page === 1 ? json.data : [...prev, ...json.data] // reset if page=1
        );
        setHasMore(page < (json.pagination?.pages || 1));
      }
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, loading]);

  // ✅ Run fetch when page changes OR when refreshFlag changes
  useEffect(() => {
    fetchContacts();
  }, [page, refreshFlag]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 50 >=
        document.documentElement.scrollHeight
      ) {
        if (!loading && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  // ✅ Always forces reload even if page=1
  const refreshContacts = () => {
    setContacts([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  return { contacts, loading, hasMore, refreshContacts };
}
