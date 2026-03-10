"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";
import { useChatStore } from "@/store/chatStore";
import { DeleteMode } from "@/utiles/enums/deleteMode";

interface OnDeletedPayload {
  mode: DeleteMode;
  deletedIds: string[];
}

export function useDeleteChats(onDeleted?: (payload: OnDeletedPayload) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { activeChat, setActiveChat } = useChatStore();

  // ✅ Single Chat Delete
  const deleteChat = async (chatId: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/wa-accounts/chats/${chatId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        showToast.success("Chat deleted successfully");

        // 🔥 Reset active chat if needed
        if (activeChat?._id?.toString() === chatId) {
          setActiveChat(null);
        }

        onDeleted?.({
          mode: DeleteMode.Single,
          deletedIds: [chatId],
        });
      } else {
        showToast.error(json.message || "Failed to delete chat");
      }
    } catch (err) {
      showToast.error("Error deleting chat");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Bulk Delete Chats
  const deleteChatsBulk = async (chatIds: string[]) => {
    if (chatIds.length === 0) {
      showToast.error("No chats selected");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/wa-accounts/chats/bulk-delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: chatIds }),
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        showToast.success("Selected chats deleted successfully");

        // 🔥 If active chat was deleted in bulk
        if (activeChat && chatIds.includes(activeChat._id!.toString())) {
          setActiveChat(null);
        }

        onDeleted?.({
          mode: DeleteMode.Bulk,
          deletedIds: chatIds,
        });
      } else {
        showToast.error(json.message || "Failed to delete selected chats");
      }
    } catch (err) {
      showToast.error("Error deleting selected chats");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Delete ALL Chats
  const deleteAllChats = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/wa-accounts/chats", {
        method: "DELETE",
        headers: {
          "x-confirm-delete-all": "true", // 🔐 optional safety
        },
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        const count = json.data?.deletedCount ?? 0;

        showToast.success(
          count > 0
            ? `${count} chats deleted successfully`
            : "No chats to delete"
        );

        // 🔥 Always reset active chat
        setActiveChat(null);

        onDeleted?.({
          mode: DeleteMode.All,
          deletedIds: [],
        });
      } else {
        showToast.error(json.message || "Failed to delete chats");
      }
    } catch (err) {
      showToast.error("Error deleting chats");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteChat,
    deleteChatsBulk,
    deleteAllChats,
    isDeleting,
  };
}
