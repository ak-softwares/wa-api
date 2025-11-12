import { create } from "zustand";

interface AiStore {
  selectedAiMenu: string | null;
  setSelectedAiMenu: (menu: string | null) => void;
}

export const useAiStore = create<AiStore>((set) => ({
  selectedAiMenu: null,
  setSelectedAiMenu: (menu) => set({ selectedAiMenu: menu }),
}));

