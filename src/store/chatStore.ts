import { create } from "zustand";
import { Chat } from "@/types/Chat";
import { Message } from "@/types/Message";
import { Types } from "mongoose";

interface ChatStore {
  // 🟢 Current active chat (opened in chat window)
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;

  // 🆕 Latest incoming message + chat (from Pusher)
  newMessage: Message | null;
  newChat: Chat | null;
  setNewMessageData: (message: Message | null, chat: Chat | null) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeChat: null,
  setActiveChat: (chat) => set({ activeChat: chat }),

  newMessage: null,
  newChat: null,
  setNewMessageData: (message, chat) => set({ newMessage: message, newChat: chat }),
}));
