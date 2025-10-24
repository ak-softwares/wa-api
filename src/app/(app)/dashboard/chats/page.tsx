"use client";

import { Suspense } from "react";
import ChatPage from "@/components/dashboard/chats/ChatPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}
