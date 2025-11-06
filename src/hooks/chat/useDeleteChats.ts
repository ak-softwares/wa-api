// hooks/useDeleteChats.ts
"use client";
import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

export function useDeleteChats(onDeleted?: () => void) {
  const [deleting, setDeleting] = useState(false);

  // ✅ Single Chat Delete
  const deleteChat = async (chatId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/whatsapp/chats/${chatId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success(`Chat deleted successfully`);
        onDeleted?.();
        return true;
      } else {
        toast.error(json.message || "Failed to delete chat");
        return false;
      }
    } catch (err) {
      toast.error("Error deleting chat");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Bulk Delete Chats
  const deleteChatsBulk = async (selectedChats: string[]) => {
    if (selectedChats.length === 0) {
      toast.error("No chats selected");
      return false;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/whatsapp/chats/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedChats }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success("Selected chats deleted successfully");
        onDeleted?.();
        return true;
      } else {
        toast.error(data.message || "Failed to delete selected chats");
        return false;
      }
    } catch (err) {
      toast.error("Error deleting selected chats");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteChat, deleteChatsBulk, deleting };
}
