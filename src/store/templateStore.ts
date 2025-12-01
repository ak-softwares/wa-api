import { create } from "zustand";
import { Template } from "@/types/Template";

interface TemplateStore {
  selectedTemplateMenu: string | null;
  setSelectedTemplateMenu: (menu: string | null) => void;

  duplicateTemplateData: Template | null;
  setDuplicateTemplateData: (template: Template | null) => void;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  selectedTemplateMenu: null,
  setSelectedTemplateMenu: (menu) => set({ selectedTemplateMenu: menu }),

  duplicateTemplateData: null,
  setDuplicateTemplateData: (template) => set({ duplicateTemplateData: template }),
}));
