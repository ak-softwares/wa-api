"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chatStore";
import { showToast } from "../ui/sonner";
import { MESSAGE_TAGS } from "@/utiles/enums/messageTags";
import { Message } from "@/types/Message";
import { Chat } from "@/types/Chat";


export default function PusherListener() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Reactive to URL change
  const { data: session, status } = useSession();
  const { activeChat, setActiveChat, setNewMessageData, setUpdateMessageStatus } = useChatStore();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const userChannel = pusher.subscribe(`user-${session.user.id}`);

    const requestNotificationPermission = async () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    };

    void requestNotificationPermission();

    // ----------------------------------
    // 🔹 NEW MESSAGE EVENT
    // ----------------------------------
    userChannel.bind("new-message", (data: any) => {
      const chat = data.chat as Chat;
      const msg = data.message as Message;

      setNewMessageData(msg, chat);
      
      const isAIMessage = msg?.tag === MESSAGE_TAGS.AI_ASSISTANT || msg?.tag === MESSAGE_TAGS.AI_AGENT;

      // 🛑 Skip notification for AI messages
      if (isAIMessage) return;
      
      // ✅ Detect chat page properly even during client-side navigation
      const isOnChatPage = pathname === "/dashboard/chats" || pathname.startsWith("/dashboard/chats/");
      // 🚫 Skip toast if on chat page or currently viewing the same chat
      if (isOnChatPage) return;

      const fullMessage = msg.message || "";
      const shortMessage = fullMessage.length > 60 ? fullMessage.substring(0, 57).trim() + "..." : fullMessage;

      // Reusable for toast button
      const openChatFromToast = () => {
        setActiveChat(chat);
        router.push("/dashboard/chats");
      };

      
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const browserNotification = new Notification(msg.from || "New message", {
          body: shortMessage || "You received a new message",
          icon: "/assets/icons/tools/wa-api-icon.png",
          badge: "/assets/icons/tools/wa-api-icon.png",
          tag: `chat-${chat?._id || msg?._id || Date.now()}`,
        });

        browserNotification.onclick = () => {
          window.focus();
          openChatFromToast();
          browserNotification.close();
        };
      }

      showToast.success(msg.from, {
        description: shortMessage,
        duration: 5000,
        action: {
          label: "View",
          onClick: () => openChatFromToast(),
        },
      });
    });

    // ----------------------------------
    // 🔹 MESSAGE STATUS UPDATE EVENT
    // ----------------------------------
    userChannel.bind("message-status-update", (data: any) => {
      const updatedMessage = data.message;
      // console.log("status: " + updatedMessage.status)

      if (!updatedMessage?._id) return;
      setUpdateMessageStatus(updatedMessage);
    });

    return () => {
      userChannel.unbind_all();
      userChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [status, session?.user?.id, pathname, router, setNewMessageData, setUpdateMessageStatus]);

  return null;
}
