"use client";

import { Suspense } from "react";
import MessagesPage from "@/components/dashboard/chats/MessagePage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesPage />
    </Suspense>
  );
}
