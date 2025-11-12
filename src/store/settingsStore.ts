import { create } from "zustand";

interface SettingsStore {
  selectedSettingsMenu: string | null;
  setSelectedSettingsMenu: (menu: string | null) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  selectedSettingsMenu: null,
  setSelectedSettingsMenu: (menu) => set({ selectedSettingsMenu: menu }),
}));

