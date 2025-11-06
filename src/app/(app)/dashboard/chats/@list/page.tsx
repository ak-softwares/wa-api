"use client";

import { Suspense } from "react";
import ChatList from "@/components/dashboard/chats/chatList";
import { ChatsProvider } from "@/hooks/chat/ChatsContext";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || undefined;

  return (
    <Suspense>
      <ChatsProvider phone={phone}>
        <ChatList />
      </ChatsProvider>
    </Suspense>
  );
}
