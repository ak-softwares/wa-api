"use client";

import { createContext, useContext, ReactNode, useRef } from "react";
import { useChats } from "@/hooks/chat/useChats";

type ChatsContextType = ReturnType<typeof useChats>;

const ChatsContext = createContext<ChatsContextType | null>(null);

export function ChatsProvider({ children, phone }: { children: ReactNode; phone?: string }) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const chatsState = useChats({ sidebarRef, phone });

  return (
    <ChatsContext.Provider value={chatsState}>
      {children}
    </ChatsContext.Provider>
  );
}

export function useChatsContext() {
  const ctx = useContext(ChatsContext);
  if (!ctx) throw new Error("useChatsContext must be used inside ChatsProvider");
  return ctx;
}
