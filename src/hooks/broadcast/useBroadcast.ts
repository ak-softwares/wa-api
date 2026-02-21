"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant } from "@/types/Chat";

type CreateProps = {
  broadcastName: string;
  participants: ChatParticipant[];
};

type UpdateProps = {
  broadcastId: string;
  broadcastName?: string;
  participants?: ChatParticipant[];
};

export const useBroadcast = (onSuccess?: () => void) => {
  const router = useRouter();
  const [updatingBroadcast, setUpdatingBroadcast] = useState(false);
  const [creatingBroadcast, setCreatingBroadcast] = useState(false);
  const { setActiveChat, setNewMessageData } = useChatStore();


  const createBroadcast = async ({broadcastName, participants}: CreateProps) => {

    if (!participants.length) {
      showToast.error("Please select at least one contact!");
      return;
    }

    try {
      setCreatingBroadcast(true);
      const response = await fetch("/api/wa-accounts/chats/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          broadcastName,
          participants,
        }),
      });

      const data = await response.json();
      const chat = data.data;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create broadcast chat");
      }

      if (onSuccess) onSuccess();

      setNewMessageData(null, chat);
      setActiveChat(chat);

      showToast.success("Broadcast list created");
      router.push("/dashboard/chats");
    } catch (err: any) {
      showToast.error(err.message || "Broadcast creation failed");
    } finally {
      setCreatingBroadcast(false);
    }
  };

  const updateBroadcast = async ({ broadcastId, broadcastName, participants }: UpdateProps) => {
    if (!participants?.length) {
      showToast.error("Please select at least one contact!");
      return;
    }

    try {
      setUpdatingBroadcast(true);

      const response = await fetch("/api/wa-accounts/chats/broadcast", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            broadcastId,
            broadcastName,
            participants,
          }),
        }
      );

      const data = await response.json();
      const chat = data.data;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update broadcast chat");
      }

      if (onSuccess) onSuccess();

      setNewMessageData(null, chat);
      setActiveChat(chat);

      showToast.success("Broadcast updated");
    } catch (err: any) {
      showToast.error(err.message || "Broadcast update failed");
    } finally {
      setUpdatingBroadcast(false);
    }
  };
  return { creatingBroadcast, createBroadcast, updatingBroadcast, updateBroadcast };
};
