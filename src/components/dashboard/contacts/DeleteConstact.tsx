"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";

interface DeleteContactDialogProps {
  contactId: string;
  contactName: string;
  onContactDeleted?: () => void;
}

export default function DeleteContactDialog({
  contactId,
  contactName,
  onContactDeleted,
}: DeleteContactDialogProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/whatsapp/contacts/${contactId}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();
      if (json.success) {
        setIsDeleteDialogOpen(false);
        if (onContactDeleted) onContactDeleted();
        toast.success(`Contact "${contactName}" deleted successfully`);
      } else {
        toast.error(json.message || "Failed to delete contact");
      }
    } catch (err) {
      toast.error("Error deleting contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 text-red-500 hover:text-red-500">
          <Trash className="w-4 h-4 text-red-500" /> Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold">{contactName}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
