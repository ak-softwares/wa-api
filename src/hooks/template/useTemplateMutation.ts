"use client";

import { TemplateComponentCreate } from "@/types/Template";
import { TemplateCategory } from "@/utiles/enums/template";

export type TemplateMutationInput = {
  id?: string;
  name: string;
  category: TemplateCategory;
  language: string;
  components: TemplateComponentCreate[];
};

export function useTemplateMutation() {
  const mutateTemplate = async ({ isEdit, payload }: { isEdit: boolean; payload: TemplateMutationInput }) => {
    const res = await fetch("/api/wa-accounts/templates", {
      method: isEdit ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res.json();
  };

  return { mutateTemplate };
}
