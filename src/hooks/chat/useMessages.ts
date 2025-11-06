"use client";

import { useEffect, useState, useCallback } from "react";
import Pusher from "pusher-js";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { Message } from "@/types/Message";
import { Chat, ChatParticipant } from "@/types/Chat";
import { MessageStatus } from "@/types/MessageStatus";
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { ApiResponse } from "@/types/apiResponse";
import { Types } from "mongoose";

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
  const router = useRouter();
  const { sendMessage } = useSendWhatsappMessage();

  const fetchMessages = useCallback(
    async (pageToFetch: number) => {

      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

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

  // pusher
  useEffect(() => {

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`chat-${chatId}`);
    channel.bind("new-message", (data: any) => {
      toast.message(data.message.from, {
        description: data.message.message,
        duration: 5000,
        action: {
          label: "View",
          onClick: () =>
            router.push(`/dashboard/messages?phone=${data.message.from}`),
        },
      });

      setMessages((prev) => [data.message, ...prev]);
    });

    return () => {
      pusher.unsubscribe(`chat-${chatId}`);
      pusher.disconnect();
    };
  }, [chatId, router]);


  const onSend = async (text: string) => {
    if (!text.trim()) return;
    const tempId = new Types.ObjectId();

    const tempMessage: Message = {
        _id: tempId,
        userId: "local-user" as any,
        chatId: chatId as any,
        to: "",
        from: "me",
        message: text,
        status: MessageStatus.Sent,
        participants: [], // ✅ required
        type: "text" as any,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setMessages((prev) => [tempMessage, ...prev]);

    await sendMessage(
        chatId,
        text.trim(),
        () => {
            setMessages((prev) =>
                prev.map((msg) =>
                msg._id === tempId ? { ...msg, status: MessageStatus.Sent } : msg
                )
            );
        },
        (errorMsg) => {
            // 🔔 Show toast on error
            // toast.error(errorMsg || "Failed to send message");
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
    onSend,
    loading,
    loadingMore,
    hasMore,
    refreshMessages,
  };
}
