import { create } from "zustand";

interface ContactStore {
  selectedContactMenu: string | null;        // or use an ID: number | string | null
  setSelectedContactMenu: (menu: string | null) => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  selectedContactMenu: null,
  setSelectedContactMenu: (menu) => set({ selectedContactMenu: menu }),
}));
