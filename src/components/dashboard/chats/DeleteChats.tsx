"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";

interface DeleteChatDialogProps {
  chatId: string;
  chatName: string;
  onChatDeleted?: () => void;
}

export default function DeleteChatDialog({
  chatId,
  chatName,
  onChatDeleted,
}: DeleteChatDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/chats/${chatId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();
      if (json.success) {
        setIsOpen(false);
        if (onChatDeleted) onChatDeleted();
        toast.success(`Chat with "${chatName}" deleted successfully`);
      } else {
        toast.error(json.message || "Failed to delete chat");
      }
    } catch (err) {
      toast.error("Error deleting chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="flex w-full items-center gap-2 text-red-500 hover:text-red-500 hover:bg-gray-700"
        onClick={() => setIsOpen(true)}
      >
        <Trash className="w-4 h-4 text-red-500" /> Delete
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the chat with{" "}
              <span className="font-semibold">{chatName}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete} // Fixed: Call handleDelete instead of setIsOpen
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}