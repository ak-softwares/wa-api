"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { Context, Message } from "@/types/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { ApiResponse } from "@/types/apiResponse";
import { Types } from "mongoose";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";

interface UseMessagesProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  chatId: string;
}

export function useMessages({ containerRef, chatId }: UseMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const { sendMessage } = useSendWhatsappMessage();
  const { newMessage, newChat, setNewMessageData } = useChatStore();
  const { appendMessage, setAppendMessage } = useMessageStore();

  useEffect(() => {
    if (!appendMessage) return;
    if (!chatId) return;
    if (appendMessage.message.chatId!.toString() !== chatId) return;

    const { message, tempId } = appendMessage;

    setMessages((prev) => {
      // Check if message with tempId exists
      const exists = prev.some(
        (msg) => msg._id?.toString() === tempId?.toString()
      );

      if (exists) {
        // 🔄 Replace temp message with real message
        return prev.map((msg) =>
          msg._id?.toString() === tempId?.toString() ? message : msg
        );
      } else {
        // ➕ Append new message (real one)
        return [message, ...prev];
      }
    });
    setAppendMessage(null, null);
  }, [appendMessage, chatId]);

  // 🔹 When a new message arrives via Pusher → append it if chat matches
  useEffect(() => {
    if (!newMessage || !newChat) return;

    if (chatId && newChat._id!.toString() === chatId) {
      setMessages((prev) => {
        // avoid duplicates
        const exists = prev.some((m) => m._id === newMessage._id);
        return exists ? prev : [newMessage, ...prev];
      });
    }

    // optional: clear message after handling
    setNewMessageData(null, null);
  }, [newMessage, newChat, chatId, setNewMessageData]);

  const fetchMessages = useCallback(
    async (pageToFetch: number) => {

      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      if (!chatId) {
        setMessages([]);
        setHasMore(false);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      
      try {
        const res = await fetch(
          `/api/whatsapp/messages?chatId=${chatId}&page=${pageToFetch}&per_page=${perPage}`
        );
        const json: ApiResponse = await res.json();

        if (json.success && json.data && Array.isArray(json.data)) {
          setMessages((prev) =>
            pageToFetch === 1
              ? [...json.data]
              : [...prev, ...[...json.data]]
          );
          setHasMore(pageToFetch < (json.pagination?.totalPages || 1));
        } else {
          setMessages(pageToFetch === 1 ? [] : (prev) => prev);
          setHasMore(false);
        }
      } catch (err) {
        toast.error("Failed to load messages.");
      } finally {
        if (pageToFetch === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [chatId, perPage]
  );

  // fetch on chat/page/refresh
  useEffect(() => {
    fetchMessages(page);
  }, [chatId, page, refreshFlag, fetchMessages]);


  useEffect(() => {
    // Reset everything on chat change
    setMessages([]);
    setPage(1);
    setHasMore(true);

    // Fetch first page explicitly
    fetchMessages(1);
  }, [chatId, fetchMessages]);


  // infinite scroll
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    const handleScroll = () => {
      if (-container.scrollTop + container.clientHeight + 50 >= container.scrollHeight) {
        if (!loading && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [containerRef, loading, loadingMore, hasMore]);

  const onSend = async ({ text, context }: { text: string; context?: Context }) => {
    if (!text.trim()) return;
    const tempId = new Types.ObjectId();

    const tempMessage: Message = {
        _id: tempId,
        userId: "local-user" as any,
        chatId: chatId as any,
        to: "",
        from: "me",
        message: text,
        status: MessageStatus.Pending,
        participants: [], // ✅ required
        type: "text" as any,
        context,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setMessages((prev) => [tempMessage, ...prev]);

    await sendMessage(
        chatId,
        text.trim(),
        context,
        (realMessage) => {
            // 🔥 Replace temp with real message
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === tempId ? realMessage : msg
              )
            );
        },
        (errorMsg) => {
            // 🔔 Show toast on error
            toast.error(errorMsg || "Failed to send message");
            setMessages((prev) =>
                prev.map((msg) =>
                msg._id === tempId ? { ...msg, status: MessageStatus.Failed } : msg
                )
            );
        }
    );
  };

  const refreshMessages = () => {
    setMessages([]);
    setHasMore(true);
    setPage(1);
    setRefreshFlag((f) => f + 1);
  };

  return {
    messages,
    setMessages,
    onSend,
    loading,
    loadingMore,
    hasMore,
    refreshMessages,
  };
}
