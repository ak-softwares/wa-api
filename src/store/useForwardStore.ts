// store/useForwardStore.ts
import { create } from "zustand";

export const useForwardStore = create((set) => ({
  forwardMessage: null,

  openForwardModal: (msg: any) =>
    set({
      forwardMessage: msg,
      showModal: true,
    }),

  closeForwardModal: () =>
    set({ showModal: false, forwardMessage: null }),

  showModal: false,
}));
