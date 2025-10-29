"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { IChat } from "@/types/Chat";

interface UseChatsProps {
  sidebarRef?: React.RefObject<HTMLDivElement | null>;
  phone?: string;
}

export function useChats({ sidebarRef, phone }: UseChatsProps) {
  const [chats, setChats] = useState<IChat[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [activeChat, setActiveChat] = useState<IChat | null>(null);
  const [query, setQuery] = useState(""); // 🔍 search query state

  const fetchChats = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let url: string;

        if (query) {
          // 🔍 Searching
          url = `/api/whatsapp/chats?q=${encodeURIComponent(query)}&page=${pageToFetch}&per_page=${perPage}`;
        } else if (phone && activeChat == null) {
          // 📱 fetch by phone (ensure temp chat is included)
          url = `/api/whatsapp/chats?page=${pageToFetch}&per_page=${perPage}&phone=${phone}`;
        } else {
          // 📦 regular fetch
          url = `/api/whatsapp/chats?page=${pageToFetch}&per_page=${perPage}`;
        }

        const res = await fetch(url);
        const json: ApiResponse = await res.json();

        if (json.success && json.data && Array.isArray(json.data)) {
          setChats(prev => (pageToFetch === 1 ? json.data : [...prev, ...json.data]));
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));

          if (phone && activeChat == null) {
            setActiveChat(json.data[0]);
          }
        } else {
          setChats(prev => (pageToFetch === 1 ? [] : prev));
          setHasMore(false);
          toast.error("Error: " + json.message);
        }
      } catch {
        toast.error("Failed to load chats.");
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [perPage, query, phone]
  );

  useEffect(() => {
    fetchChats(page);
  }, [page, query, refreshFlag, fetchChats]);

  useEffect(() => {
    const container = sidebarRef?.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight + 50 >= container.scrollHeight) {
        if (!loading && !loadingMore && hasMore) {
          setPage(prev => prev + 1);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sidebarRef, loading, loadingMore, hasMore]);

  useEffect(() => {
    const chatId = activeChat?._id;
    if (!chatId) return;

    // Instantly update UI
    setChats(prev =>
      prev.map(c =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      )
    );

    // Update database if unread messages exist
    if ((activeChat?.unreadCount ?? 0) > 0) {
      (async () => {
        try {
          await fetch(`/api/whatsapp/chats/${chatId}/mark-read`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unreadCount: 0 }),
          });
        } catch (err) {
          console.error("Failed to mark chat as read:", err);
        }
      })();
    }
  }, [activeChat]);


  const refreshChats = () => {
    setQuery("");
    setChats([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag(f => f + 1);
  };

  const searchChats = (newQuery: string) => {
    setQuery(newQuery);
    setChats([]);
    setPage(1);
    setHasMore(true);
  };

  return {
    chats,
    setChats,
    loading,
    loadingMore,
    hasMore,
    refreshChats,
    searchChats, // 🔍 expose search method
    activeChat,
    setActiveChat,
    sidebarRef,
  };
}
