// hooks/useDeleteMessages.ts
"use client";
import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

export function useDeleteMessages(onDeleted?: () => void) {
  const [deleting, setDeleting] = useState(false);

  // ✅ Single Message Delete
  const deleteMessage = async (messageId: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/whatsapp/messages/${messageId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        toast.success(`Message deleted successfully`);
        onDeleted?.();
        return true;
      } else {
        toast.error(json.message || "Failed to delete message");
        return false;
      }
    } catch (err) {
      toast.error("Error deleting message");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  // ✅ Bulk Delete Messages
  const deleteMessagesBulk = async (selectedMessages: string[]) => {
    if (selectedMessages.length === 0) {
      toast.error("No messages selected");
      return false;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/whatsapp/messages/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedMessages }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success("Selected messages deleted successfully");
        onDeleted?.();
        return true;
      } else {
        toast.error(data.message || "Failed to delete selected messages");
        return false;
      }
    } catch (err) {
      toast.error("Error deleting selected messages");
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    deleteMessage,
    deleteMessagesBulk,
    deleting,
  };
}
