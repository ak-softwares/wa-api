"use client";

import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useChatStore } from "@/store/chatStore";
import { ApiResponse } from "@/types/apiResponse";
import { ChatParticipant } from "@/types/Chat";

export function useFindOrCreateChat(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const { setActiveChat, setNewMessageData } = useChatStore();

  const findOrCreateChat = async ({ participant }: {participant: ChatParticipant}) => {
    try {
      setLoading(true);
      const res = await fetch("/api/wa-accounts/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant }),
      });

      if (!res.ok) {
        toast.error("Failed to load chat.");
        return;
      }
      
      const data = await res.json();
      const chat = data?.data;
      if (!chat) {
        toast.error("Chat not found.");
        return;
      }

      // ⭐️ Set active chat
      setNewMessageData(null, chat);
      setActiveChat(chat);
      onSuccess?.();
    } catch (e) {
      toast.error("Error creating chat");
    }finally{
      setLoading(false);
    }
  };

  return {
    loading, findOrCreateChat
  };
}
