"use client";

import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { showToast } from "@/components/ui/sonner";
import { Message } from "@/types/Message";
import { MessageStatus } from "@/types/MessageType";
import { ApiResponse } from "@/types/apiResponse";
import { useChatStore } from "@/store/chatStore";
import { useMessageStore } from "@/store/messageStore";
import { MessagePayload } from "@/types/MessageType";
import { sendMessage } from "@/services/message/sendMessage";
import { Template } from "@/types/Template";
import { ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";
import { useChatOpenClose } from "../chat/useChatOpenClose";

interface UseMessagesProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  chatId: string;
}

export function useMessages({ containerRef, chatId }: UseMessagesProps) {
  // console.trace("fetchChats called");
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { newMessage, newChat, setNewMessageData, updatedMessageStatus, setUpdateMessageStatus } = useChatStore();
  const { appendMessage, setAppendMessage } = useMessageStore();
  const currentChatIdRef = useRef<string>(chatId);
  const { openChat, closeChat } = useChatOpenClose({
    onChange: ({ chatId, opened }) => {
      if (opened) {
        // ✅ instantly update unread count in UI

      }
    },
  });

  useEffect(() => {
    if (!chatId) return;
    // ✅ OPEN chat
    openChat(chatId);

    return () => {
      // ✅ CLOSE chat
      closeChat(chatId);
    };
  }, [chatId]);

  // 🔥 Update ref when chatId changes
  useEffect(() => {
    currentChatIdRef.current = chatId;
  }, [chatId]);

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
    if (!newMessage) return;

    if (chatId && newMessage.chatId === chatId) {
      setMessages((prev) => {
        // avoid duplicates
        const exists = prev.some((m) => m._id === newMessage._id);
        return exists ? prev : [newMessage, ...prev];
      });
    }

    // optional: clear message after handling
    setNewMessageData(null, null);
  }, [newMessage, newChat, chatId, setNewMessageData]);

  // 🔹 When message status updates → update existing message
  useEffect(() => {
    if (!updatedMessageStatus) return;

    setMessages((prev) =>
      prev.map((m) =>
        m._id === updatedMessageStatus._id
          ? { ...m, ...updatedMessageStatus }
          : m
      )
    );

    // clear after handling
    setUpdateMessageStatus(null);
  }, [updatedMessageStatus, setUpdateMessageStatus]);

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
          `/api/wa-accounts/messages?chatId=${chatId}&page=${pageToFetch}&per_page=${ITEMS_PER_PAGE}`
        );
        const json: ApiResponse = await res.json();
        // 🛑 IGNORE STALE RESPONSE
        if (chatId !== currentChatIdRef.current) return;
        if (json.success && json.data && Array.isArray(json.data)) {
          // console.log("chatId:", chatId, "currentChatIdRef:" + currentChatIdRef.current);
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
        showToast.error("Failed to load messages.");
      } finally {
        if (chatId !== currentChatIdRef.current) return;
        if (pageToFetch === 1) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [chatId]
  );

  // fetch on chat/page/refresh
  useEffect(() => {
    if (page === 1) return; // prevent duplicate page=1 fetch
    fetchMessages(page);
  }, [page, fetchMessages]);



  useLayoutEffect(() => {
    if (!chatId) return;

    setMessages([]);
    setPage(1);
    setHasMore(true);

    fetchMessages(1);
  }, [chatId]);

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

  const onSend = async ({ messagePayload }: { messagePayload: MessagePayload; }) => {
    const tempId = crypto.randomUUID(); // ✅
    const now = new Date().toISOString();

    const tempMessage: Message = {
        _id: tempId,
        userId: "local-user" as any,
        chatId: chatId as any,
        to: "",
        from: "me",
        message: messagePayload.message,
        media: messagePayload.media,
        template: messagePayload.template as Template || undefined,
        status: MessageStatus.Pending,
        participants: [], // ✅ required
        type: messagePayload.messageType,
        context: messagePayload.context,
        createdAt: now,
        updatedAt: now,
    };

    setMessages((prev) => [tempMessage, ...prev]);

    try {
      const message: Message = await sendMessage({ messagePayload });
      setMessages((prev) => prev.map((msg) => msg._id === tempId ? message : msg)); // 🔥 Replace temp with real message
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to send message";
      // 🔔 Show toast on error
      showToast.error(errorMsg);
      setMessages((prev) => prev.map((msg) => msg._id === tempId ? { ...msg, status: MessageStatus.Failed } : msg ));
    }
  };

  const refreshMessages = () => {
    setMessages([]);
    setHasMore(true);
    setPage(1);
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
