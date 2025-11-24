"use client";

import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { ChatParticipant } from "@/types/Chat";
import { useChatStore } from "@/store/chatStore";

interface EditMembersHook {
  loading: boolean;
  addMembers: (chatId: string, members: ChatParticipant[]) => Promise<void>;
  removeMembers: (chatId: string, members: ChatParticipant[]) => Promise<void>;
}

export function useEditMembers(): EditMembersHook {
  const [loading, setLoading] = useState(false);

  const { activeChat, setActiveChat } = useChatStore();

  // ---------------------------------------
  // ADD MEMBERS
  // ---------------------------------------
  const addMembers = async (chatId: string, members: ChatParticipant[]) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/whatsapp/chats/${chatId}/edit-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to add members");
        return;
      }

      const updatedChat = json.data;

      // Update active chat
      if (activeChat?._id?.toString() === chatId) {
        setActiveChat(updatedChat);
      }

      toast.success("Members added successfully");
    } catch (error) {
      toast.error("Error adding members");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // REMOVE MEMBERS
  // ---------------------------------------
  const removeMembers = async (chatId: string, members: ChatParticipant[]) => {
    try {
      setLoading(true);

      const res = await fetch(`/api/whatsapp/chats/${chatId}/edit-members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ members }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to remove members");
        return;
      }

      const updatedChat = json.data;

      // Update active chat
      if (activeChat?._id?.toString() === chatId) {
        setActiveChat(updatedChat);
      }

      toast.success("Members removed successfully");
    } catch (error) {
      toast.error("Error removing members");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    addMembers,
    removeMembers,
  };
}
