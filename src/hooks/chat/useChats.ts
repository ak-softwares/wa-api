"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { IChat } from "@/types/chat";

interface UseChatsProps {
  sidebarRef?: React.RefObject<HTMLDivElement | null>; // ✅ use HTMLDivElement, not HTMLElement
  phone?: string; // <-- take phone as prop
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

  const fetchChats = useCallback(async (pageToFetch: number) => {
    if (pageToFetch === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = phone && activeChat == null
        ? `/api/whatsapp/chats?page=${pageToFetch}&per_page=${perPage}&phone=${phone}`
        : `/api/whatsapp/chats?page=${pageToFetch}&per_page=${perPage}`;

      const res = await fetch(url);
      const json: ApiResponse = await res.json();
      
      if (json.success && json.data && Array.isArray(json.data)) {
        setChats(prev => pageToFetch === 1 ? json.data : [...prev, ...json.data]);
        setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
        // If first page & activeChat is null, make the first chat active
        if (pageToFetch === 1 && activeChat == null && json.data.length > 0) {
          setActiveChat(json.data[0]);
        }
      } else {
        setChats(prev => pageToFetch === 1 ? [] : prev);
        setHasMore(false);
      }
    } catch (err) {
      toast.error("Failed to load chats.");
    } finally {
      if (pageToFetch === 1) setLoading(false);
      else setLoadingMore(false);
    }
  }, [perPage]);

  useEffect(() => {
    fetchChats(page);
  }, [page, refreshFlag, fetchChats]);

  useEffect(() => {
    const container = sidebarRef?.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop + container.clientHeight + 50 >= container.scrollHeight) {
        if (!loading && !loadingMore && hasMore) setPage(prev => prev + 1);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [sidebarRef, loading, loadingMore, hasMore]);

  const refreshChats = () => {
    setChats([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag(f => f + 1);
  };

  return { chats, setChats, loading, loadingMore, hasMore, refreshChats, activeChat, setActiveChat, sidebarRef };
}
