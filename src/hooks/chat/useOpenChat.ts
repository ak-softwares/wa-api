"use client";

import { useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { useChatStore } from "@/store/chatStore";

export function useOpenChat() {
  const { activeChat, setActiveChat, setNewMessageData } = useChatStore();

  const openChatByContact = useCallback(async (phone: String) => {
    try {
      const res = await fetch(
        `/api/whatsapp/chats/by-phone?phone=${phone}`
      );

      if (!res.ok) {
        toast.error("Failed to load chat.");
        return;
      }

      const data = await res.json();
      const chat = data?.data?.chat;
      if (!chat) {
        toast.error("Chat not found.");
        return;
      }

      // ⭐️ Set active chat
      setNewMessageData(null, chat);
      setActiveChat(chat);

    } catch (err) {
      toast.error("Something went wrong while opening the chat.");
    }
  }, [setActiveChat]);

  return {
    openChatByContact,
  };
}
