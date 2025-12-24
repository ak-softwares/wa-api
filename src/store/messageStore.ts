import { create } from "zustand";
import { Message } from "@/types/Message";

interface MessageStore {
  appendMessage: { message: Message; tempId: string | null; } | null;
  setAppendMessage: ( message: Message | null, tempId?: string | null ) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  appendMessage: null,
  setAppendMessage: (message, tempId = null) =>
    set({
      appendMessage: message ? { message, tempId } : null,
    }),
}));
