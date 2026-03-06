"use client";

import { showToast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";
import { TemplateComponentCreate } from "@/types/Template";
import { TemplateCategory } from "@/utiles/enums/template";
import { useState } from "react";

export type TemplateMutationInput = {
  id?: string;
  name: string;
  category: TemplateCategory;
  language: string;
  components: TemplateComponentCreate[];
};

export function useTemplateMutation(onSuccess?: () => void) {
  const [isSaving, setIsSaving] = useState(false);

  const createTemplate = async (payload: TemplateMutationInput) => {
    try {
      setIsSaving(true);

      const res = await fetch("/api/wa-accounts/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: ApiResponse = await res.json();

      if (!data.success) {
        showToast.error(data.message || "Failed to create template");
        return;
      }

      showToast.success(data.message || "Template created");
      onSuccess?.();
    } catch (error: any) {
      showToast.error("Something went wrong " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const editTemplate = async (payload: TemplateMutationInput) => {
    try {
      setIsSaving(true);

      const res = await fetch(
        `/api/wa-accounts/templates/${encodeURIComponent(payload.id ?? "")}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data: ApiResponse = await res.json();

      if (!data.success) {
        showToast.error(data.message || "Failed to update template");
        return;
      }

      showToast.success(data.message || "Template updated");
      onSuccess?.();
    } catch (error: any) {
      showToast.error("Something went wrong " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return { isSaving, createTemplate, editTemplate };
}
