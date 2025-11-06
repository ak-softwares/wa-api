"use client";

import ChatList from "@/components/dashboard/chats/chatList";
import { ChatsProvider } from "@/hooks/chat/ChatsContext";

export default function ChatPage({
  searchParams,
}: {
  searchParams: { phone?: string };
}) {
  const phone = searchParams.phone || undefined;

  return (
      <ChatsProvider phone={phone}>
        <ChatList />
      </ChatsProvider>
  );
}
