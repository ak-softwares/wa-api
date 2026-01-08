"use client";

import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function useDeleteTemplate(onDeleteSuccess?: () => void) {
  // -------------------------------
  // SINGLE DELETE STATES
  // -------------------------------
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [singleDeleting, setSingleDeleting] = useState(false);

  // -------------------------------
  // BULK DELETE STATES
  // -------------------------------
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // -------------------------------
  // OPEN SINGLE DELETE
  // -------------------------------
  const openDeleteDialog = (name: string) => {
    setTemplateToDelete(name);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (singleDeleting) return; // prevent accidental close during delete
    setTemplateToDelete(null);
    setDeleteDialogOpen(false);
  };

  // -------------------------------
  // OPEN BULK DELETE
  // -------------------------------
  const openBulkDeleteDialog = (names: string[]) => {
    setSelectedTemplates(names);
    setBulkDeleteDialogOpen(true);
  };

  const closeBulkDeleteDialog = () => {
    if (bulkDeleting) return; // prevent accidental close during delete
    setSelectedTemplates([]);
    setBulkDeleteDialogOpen(false);
  };

  // -------------------------------
  // CONFIRM SINGLE DELETE
  // -------------------------------
  const confirmDelete = async () => {
    if (!templateToDelete) return;
    setSingleDeleting(true);

    try {
      const res = await fetch(`/api/wa-accounts/templates/${templateToDelete}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete template.");
        return;
      }

      toast.success("Template deleted successfully.");
      onDeleteSuccess?.();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setSingleDeleting(false);
      closeDeleteDialog();
    }
  };

  // -------------------------------
  // CONFIRM BULK DELETE
  // -------------------------------
  const confirmBulkDelete = async () => {
    if (selectedTemplates.length === 0) return;
    setBulkDeleting(true);

    try {
      const res = await fetch(`/api/wa-accounts/templates/bulk-delete`, {
        method: "DELETE",
        body: JSON.stringify({ names: selectedTemplates }),
        headers: { "Content-Type": "application/json" },
      });

      const json: ApiResponse = await res.json();

      if (!json.success) {
        toast.error(json.message || "Bulk delete failed.");
        return;
      }

      toast.success("Selected templates deleted successfully.");
      onDeleteSuccess?.();
    } catch {
      toast.error("Bulk delete failed.");
    } finally {
      setBulkDeleting(false);
      closeBulkDeleteDialog();
    }
  };

  // -------------------------------
  // RETURN UI COMPONENTS
  // -------------------------------
  const DeleteDialogs = (
    <>
      {/* SINGLE DELETE */}
      <Dialog open={deleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <b>{templateToDelete}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeDeleteDialog} disabled={singleDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={singleDeleting}>
              {singleDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* BULK DELETE */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={closeBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Templates?</DialogTitle>
            <DialogDescription>
              You are deleting <b>{selectedTemplates.length}</b> templates.
              <br />This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeBulkDeleteDialog} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? "Deleting..." : "Delete All"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  return {
    openDeleteDialog,
    openBulkDeleteDialog,
    DeleteDialogs,
  };
}
