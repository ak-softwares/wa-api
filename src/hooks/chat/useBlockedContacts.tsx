"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChatParticipant } from "@/types/Chat";

export function useBlockedContacts() {
  const [blockedList, setBlockedList] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false); // ⭐ NEW
  const [actionLoading, setActionLoading] = useState(false); // ⭐ NEW

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    participant: ChatParticipant | null;
    action: "block" | "unblock" | null;
  }>({
    open: false,
    participant: null,
    action: null,
  });

  // Load blocked contacts
  const fetchBlocked = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/whatsapp/block");
      const json = await res.json();

      if (!json.success) {
        toast.error("Failed to load blocked contacts");
        return;
      }

      setBlockedList(json.data.blocked || []);
    } catch {
      toast.error("Unable to fetch blocked contacts");
    } finally {
      setLoading(false);
    }
  }, [setBlockedList]);

  useEffect(() => {
      fetchBlocked();
  }, [fetchBlocked]);

  // Block
  const blockNumber = async (participant: ChatParticipant) => {
    try {
      const res = await fetch("/api/whatsapp/block", {
        method: "POST",
        body: JSON.stringify({ number: participant.number }),
      });

      const json = await res.json();

      if (json.success) {
        setBlockedList([...blockedList, participant]);
        toast.success("Contact blocked");
      } else {
        toast.error(json.message || "Failed to block contact");
      }
    } catch {
      toast.error("Something went wrong while blocking");
    }
  };

  // Unblock
  const unblockNumber = async (participant: ChatParticipant) => {
    try {
      const res = await fetch("/api/whatsapp/block", {
        method: "DELETE",
        body: JSON.stringify({ number: participant.number }),
      });

      const json = await res.json();

      if (json.success) {
        setBlockedList(
          blockedList.filter((p) => p.number !== participant.number)
        );
        toast.success("Contact unblocked");
      } else {
        toast.error(json.message || "Failed to unblock contact");
      }
    } catch {
      toast.error("Something went wrong while unblocking");
    }
  };

  // Check if a participant is blocked
  const isBlocked = useCallback(
    (participant?: ChatParticipant | string): boolean => {
      const number = typeof participant === "string" ? participant : participant?.number;
      return blockedList.some((blocked) => blocked.number === number);
    },
    [blockedList]
  );

  // Toggle block
  const toggleBlock = async (participant?: ChatParticipant) => {
    if (!participant) return;
    if (isBlocked(participant)) {
      setDialogState({ open: true, participant, action: "unblock" });
    } else {
      setDialogState({ open: true, participant, action: "block" });
    }
  };

  // Dialog control
  const confirmBlock = (participant: ChatParticipant) => {
    setDialogState({ open: true, participant, action: "block" });
  };

  const confirmUnblock = (participant: ChatParticipant) => {
    setDialogState({ open: true, participant, action: "unblock" });
  };

  const closeDialog = () => {
    if (!actionLoading) {
      setDialogState({ open: false, participant: null, action: null });
    }
  };

  // Confirm button handler with loading
  const handleConfirm = async () => {
    const { participant, action } = dialogState;
    if (!participant?.number || !action) return;

    setActionLoading(true);

    if (action === "block") {
      await blockNumber(participant);
    } else {
      await unblockNumber(participant);
    }

    setActionLoading(false);
    closeDialog();
  };

  // -------------------------------------
  // CONFIRMATION DIALOG COMPONENT
  // -------------------------------------
  const confirmBlockDialog = () => (
    <Dialog open={dialogState.open} onOpenChange={closeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dialogState.action === "block"
              ? "Block this contact?"
              : "Unblock this contact?"}
          </DialogTitle>
        </DialogHeader>

        <p className="py-3 text-sm text-muted-foreground">
          Number: {dialogState.participant?.number}
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={closeDialog} disabled={actionLoading}>
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            variant="destructive"
            disabled={actionLoading} // ⭐ disable during API call
          >
            {actionLoading
              ? "Please wait…" // ⭐ loading text
              : dialogState.action === "block"
              ? "Block"
              : "Unblock"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return {
    blockedList,
    loading,
    isBlocked,
    toggleBlock,
    confirmBlock,
    confirmUnblock,
    confirmBlockDialog,
    blockNumber,
  };
}
