"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import { useLogoutDialog } from "./useLogoutDialog";

export function useDeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout } = useLogoutDialog();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        logout();
      } else {
        toast.error(data.message || "Failed to delete account");
      }
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const Dialog = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your account and all related data will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? "Deleting..." : "Yes, delete my account"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    openDeleteDialog: () => setOpen(true),
    DeleteAccountDialog: Dialog,
  };
}
