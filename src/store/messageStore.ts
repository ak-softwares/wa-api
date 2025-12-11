import { create } from "zustand";
import { Message } from "@/types/Message";
import { Types } from "mongoose";

interface MessageStore {
  appendMessage: { message: Message; tempId: Types.ObjectId | null; } | null;
  setAppendMessage: ( message: Message | null, tempId?: Types.ObjectId | null ) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  appendMessage: null,
  setAppendMessage: (message, tempId = null) =>
    set({
      appendMessage: message ? { message, tempId } : null,
    }),
}));
