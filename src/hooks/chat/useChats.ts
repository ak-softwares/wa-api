"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";
import { Chat } from "@/types/Chat";
import { useChatStore } from "@/store/chatStore";
import { ChatFilterType } from "@/types/Chat";
import { ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";

interface UseChatsProps {
  sidebarRef?: React.RefObject<HTMLDivElement | null>;
  phone?: string | null;
}

export function useChats({ sidebarRef, phone }: UseChatsProps = {}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [totalChats, setTotalChats] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ChatFilterType>("all");
  const { activeChat, setActiveChat, newMessage, newChat, setNewMessageData } = useChatStore();
  // console.trace("fetchChats called");

  useEffect(() => {
    if (!newChat) return;

    setChats((prev) => {
      const existingChatIndex = prev.findIndex(
        (c) => c._id === newChat._id
      );

      let updatedChats = [...prev];

      if (existingChatIndex !== -1) {
        // ✅ Replace full chat with latest data
        updatedChats.splice(existingChatIndex, 1);
      }

      // ✅ Always put latest chat on top
      updatedChats.unshift(newChat);

      return updatedChats;
    });

    // Optional: append message if active chat
    if (activeChat && newChat._id === activeChat._id) {
      // appendMessage(newMessage);
    }

    setNewMessageData(null, null);
  }, [newMessage, newChat, activeChat, setNewMessageData]);

  const fetchChats = useCallback(
    async (pageToFetch: number) => {
      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        let url: string;

        if (query) {
          // 🔍 Searching
          url = `/api/wa-accounts/chats?q=${encodeURIComponent(query)}&page=${pageToFetch}&per_page=${ITEMS_PER_PAGE}`;
        } else if (phone && activeChat == null) {
          // 📱 fetch by phone (ensure temp chat is included)
          url = `/api/wa-accounts/chats?page=${pageToFetch}&per_page=${ITEMS_PER_PAGE}&phone=${phone}`;
        } else {
          // 📦 regular fetch
          url = `/api/wa-accounts/chats?page=${pageToFetch}&per_page=${ITEMS_PER_PAGE}&filter=${filter}`;
        }

        const res = await fetch(url);
        const json: ApiResponse = await res.json();

        if (json.success && json.data && Array.isArray(json.data)) {
          setChats(prev => (pageToFetch === 1 ? json.data : [...prev, ...json.data]));
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
          setTotalChats(json.pagination?.total || 0);
          if (phone && activeChat == null) {
            setActiveChat(json.data[0]);
          }
        } else {
          setChats(prev => (pageToFetch === 1 ? [] : prev));
          setHasMore(false);
          showToast.error("Error: " + json.message);
        }
      } catch {
        showToast.error("Failed to load chats.");
      } finally {
        pageToFetch === 1 ? setLoading(false) : setLoadingMore(false);
      }
    },
    [query, phone, filter]
  );

  useEffect(() => {
    fetchChats(page);
  }, [page, query, filter, refreshFlag, fetchChats]);

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

  // 1️⃣ Runs on mount (handles toast → page navigation case)
  useEffect(() => {
    if (!activeChat?._id) return;
    markChatAsRead(activeChat);
  }, []);

  // 2️⃣ Runs when activeChat changes (handles in-page clicks)
  useEffect(() => {
    if (!activeChat?._id) return;
    markChatAsRead(activeChat);
  }, [activeChat]);

  const markChatAsRead = (chat: Chat) => {
    const chatId = chat._id;
    // instant UI update
    setChats(prev =>
      prev.map(c =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

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
    searchChats,
    totalChats,
    filter,
    setFilter,
  };
}
