"use client";

import { useEffect, useState, useCallback } from "react";
import Pusher from "pusher-js";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { IMessage } from "@/types/Message";
import { IChat, ChatParticipant } from "@/types/Chat";
import { MessageStatus } from "@/types/MessageStatus";
import { useSendWhatsappMessage } from "@/hooks/whatsapp/useSendWhatsappMessage";
import { ApiResponse } from "@/types/apiResponse";

interface UseMessagesProps {
  containerRef?: React.RefObject<HTMLDivElement | null>;
  activeChat: IChat | null;
}

export function useMessages({ containerRef, activeChat }: UseMessagesProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
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
      if (!activeChat?._id) return;

      if (pageToFetch === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(
          `/api/whatsapp/messages?chatId=${activeChat._id}&page=${pageToFetch}&per_page=${perPage}`
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
    [activeChat?._id, perPage]
  );

  // fetch on chat/page/refresh
  useEffect(() => {
    if (!activeChat) return;
    fetchMessages(page);
  }, [activeChat?._id, page, refreshFlag, fetchMessages]);


  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    // Reset everything on chat change
    setMessages([]);
    setPage(1);
    setHasMore(true);

    // Fetch first page explicitly
    fetchMessages(1);
  }, [activeChat?._id, fetchMessages]);


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
    if (!activeChat?._id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`chat-${activeChat._id}`);
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
      pusher.unsubscribe(`chat-${activeChat._id}`);
      pusher.disconnect();
    };
  }, [activeChat?._id, router]);

  const getChatPartner = (chat: IChat): ChatParticipant => chat.participants[0];

  const onSend = async (text: string) => {
    if (!text.trim() || !activeChat) return;
    const partner = getChatPartner(activeChat);
    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

    const tempMessage: IMessage = {
        _id: tempId,
        userId: "local-user" as any,
        chatId: activeChat._id as any,
        to: partner.number,
        from: "me",
        message: text,
        status: MessageStatus.Sent,
        type: "text" as any,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setMessages((prev) => [tempMessage, ...prev]);

    await sendMessage(
        partner.number,
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

  const onBroadcastSend = async (message: string) => {
    if (!message.trim() || !activeChat) return;

    // Proceed only if it's a broadcast chat
    if (activeChat.type !== "broadcast") return;

    const tempId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

    // Temporary message for instant UI update
    const tempMessage: IMessage = {
      _id: tempId,
      userId: "local-user" as any,
      chatId: activeChat._id as any,
      to: "broadcast",
      from: "me",
      message,
      status: MessageStatus.Sent, // ✅ use Sending before actual result
      type: "text" as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Instantly add message to UI
    setMessages((prev) => [tempMessage, ...prev]);

    try {
      const res = await fetch("/api/whatsapp/messages/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat._id,
          participants: activeChat.participants,
          message,
        }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        // ✅ Update message status to "Sent"
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...msg, status: MessageStatus.Sent }
              : msg
          )
        );
      } else {
        // ❌ Update message status to "Failed"
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? { ...msg, status: MessageStatus.Failed }
              : msg
          )
        );
        // console.error("Broadcast failed:", data.message);
      }
    } catch (error: any) {
      // ❌ Network or unexpected error
      // console.error("Error sending broadcast:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId
            ? { ...msg, status: MessageStatus.Failed }
            : msg
        )
      );
    }
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
    onBroadcastSend,
    loading,
    loadingMore,
    hasMore,
    refreshMessages,
  };
}
