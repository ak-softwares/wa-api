"use client";

import { useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";

interface OnDeletedPayload {
  deletedIds: string[];
  mode: "single" | "bulk";
}

export function useDeleteTemplates(
  onDeleted?: (payload: OnDeletedPayload) => void
) {
  const [isDeleting, setIsDeleting] = useState(false);

  // -------------------------------
  // SINGLE DELETE
  // -------------------------------
  const deleteTemplate = async (templateName: string) => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/wa-accounts/templates/${templateName}`, {
        method: "DELETE",
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        showToast.success("Template deleted successfully");

        onDeleted?.({
          mode: "single",
          deletedIds: [templateName],
        });
      } else {
        showToast.error(json.message || "Failed to delete template");
      }
    } catch {
      showToast.error("Error deleting template");
    } finally {
      setIsDeleting(false);
    }
  };

  // -------------------------------
  // BULK DELETE
  // -------------------------------
  const deleteTemplatesBulk = async (templateNames: string[]) => {
    if (templateNames.length === 0) {
      showToast.error("No templates selected");
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/wa-accounts/templates/bulk-delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: templateNames }),
      });

      const json: ApiResponse = await res.json();

      if (json.success) {
        showToast.success("Selected templates deleted successfully");

        onDeleted?.({
          mode: "bulk",
          deletedIds: templateNames,
        });
      } else {
        showToast.error(json.message || "Failed to delete templates");
      }
    } catch {
      showToast.error("Error deleting templates");
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteTemplate,
    deleteTemplatesBulk,
    isDeleting,
  };
}