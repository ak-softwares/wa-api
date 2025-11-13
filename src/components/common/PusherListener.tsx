"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chatStore";

export default function PusherListener() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ get current URL path
  const { data: session, status } = useSession();
  const { activeChat, setNewMessageData } = useChatStore.getState();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Listen to user-level events
    const userChannel = pusher.subscribe(`user-${session.user.id}`);

    userChannel.bind("new-message", (data: any) => {
      const chat = data.chat;
      const msg = data.message;
      
      // ✅ store both globally
      setNewMessageData(msg, chat);

      // 🚫 Skip toast if:
      // 1. Active chat is open, OR
      // 2. User is currently on /dashboard/chats
      const isOnChatPage = pathname.startsWith("/dashboard/chats");
      // if ((activeChat && chat._id === activeChat._id) || isOnChatPage) return;
      if (isOnChatPage) return;

      const fullMessage = msg.message || "";
      const shortMessage =
        fullMessage.length > 60 ? fullMessage.substring(0, 57).trim() + "..." : fullMessage;

      // 🔔 Show toast
      toast.message(msg.from, {
        description: shortMessage,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => router.push(`/dashboard/chats?phone=${msg.from}`),
        },
      });
    });

    return () => {
      pusher.unsubscribe(`user-${session.user.id}`);
      pusher.disconnect();
    };
  }, [status, session?.user?.id, router]);

  return null;
}
