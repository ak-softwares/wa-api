"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chatStore";
import { toast } from "../ui/sonner";

export default function PusherListener() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Reactive to URL change
  const { data: session, status } = useSession();
  const { activeChat, setNewMessageData } = useChatStore();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const userChannel = pusher.subscribe(`user-${session.user.id}`);

    userChannel.bind("new-message", (data: any) => {
      const chat = data.chat;
      const msg = data.message;

      setNewMessageData(msg, chat);

      // ✅ Detect chat page properly even during client-side navigation
      const isOnChatPage =
        pathname === "/dashboard/chats" ||
        pathname.startsWith("/dashboard/chats/");

      // 🚫 Skip toast if on chat page or currently viewing the same chat
      // if (isOnChatPage || (activeChat && chat._id === activeChat._id)) return;
      if (isOnChatPage) return;

      const fullMessage = msg.message || "";
      const shortMessage =
        fullMessage.length > 60 ? fullMessage.substring(0, 57).trim() + "..." : fullMessage;

      toast.success(msg.from, {
        description: shortMessage,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => router.push(`/dashboard/chats?phone=${msg.from}`),
        },
      });
    });

    return () => {
      userChannel.unbind_all();
      userChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [status, session?.user?.id, pathname, router, activeChat, setNewMessageData]);

  return null;
}
