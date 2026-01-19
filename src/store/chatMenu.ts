import { create } from "zustand";

interface ChatMenuStore {
  chatMenu: string | null;        // or use an ID: number | string | null
  setChatMenu: (menu: string | null) => void;
}

export const useChatMenuStore = create<ChatMenuStore>((set) => ({
  chatMenu: null,
  setChatMenu: (menu) => set({ chatMenu: menu }),
}));
