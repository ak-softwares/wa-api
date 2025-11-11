import { create } from "zustand";
import { IChat } from "@/types/Chat";

interface ChatStore {
  selectedChat: IChat | null;
  setSelectedChat: (chat: IChat | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedChat: null,
  setSelectedChat: (chat) => set({ selectedChat: chat }),
}));
