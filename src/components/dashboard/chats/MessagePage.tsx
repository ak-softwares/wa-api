"use client";

import { ChatsProvider } from "@/hooks/chat/ChatsContext";
import ChatList from "./chatList";
import MessageBox from "./MessageBox";
import { useSearchParams } from "next/navigation";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || undefined;
  
  return (
    <div className="min-h-screen">
      <ChatsProvider phone={phone}>
        <div className="max-w-6xl mx-auto flex h-screen">
          {/* Chats Sidebar */}
          <ChatList />

          {/* Chat Area */}
          <div className="w-2/3 flex flex-col">
            <MessageBox />
          </div>
        </div>
      </ChatsProvider>
    </div>
  );
}
