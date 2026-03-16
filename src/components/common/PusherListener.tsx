"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useChatStore } from "@/store/chatStore";
import { showToast } from "../ui/sonner";
import { MESSAGE_TAGS } from "@/utiles/enums/messageTags";
import { Message } from "@/types/Message";
import { Chat, ChatType } from "@/types/Chat";
import { getMessagePreview } from "@/lib/messages/getMessagePreview";
import { NotificationEventType } from "@/utiles/enums/notification";
import { NotificationPayload } from "@/types/Notification";
import { formatInternationalPhoneNumber } from "@/utiles/formater/formatPhone";


export default function PusherListener() {
  const router = useRouter();
  const pathname = usePathname(); // ✅ Reactive to URL change
  const { data: session, status } = useSession();
  const { setActiveChat, setNewMessageData, setUpdateMessageStatus } = useChatStore();

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
    userChannel.bind(NotificationEventType.NEW_MESSAGE, (data: any) => {
      const notificationPayload = data.notificationPayload as NotificationPayload;
      const chat = notificationPayload.chat as Chat;
      const msg = notificationPayload.message as Message;
      const eventType = notificationPayload.eventType as NotificationEventType;

      if(eventType === NotificationEventType.STATUS_UPDATE) {
        setUpdateMessageStatus(msg);
      } else if (eventType === NotificationEventType.NEW_MESSAGE) {

        setNewMessageData(msg, chat);
      
        // 🛑 Skip notification for AI messages
        const isAIMessage = msg?.tag === MESSAGE_TAGS.AI_ASSISTANT || msg?.tag === MESSAGE_TAGS.AI_AGENT;
        if (isAIMessage) return;
        
        // 🚫 Skip toast if on chat page or currently viewing the same chat
        const isOnChatPage = pathname === "/dashboard/chats" || pathname.startsWith("/dashboard/chats/");
        if (isOnChatPage) return;

        // Reusable for toast button
        const openChatFromToast = () => {
          setActiveChat(chat);
          router.push("/dashboard/chats");
        };

        const isBroadcast = chat.type === ChatType.BROADCAST;
        const partner = chat.participants[0];
        const messageTitle = isBroadcast
          ? chat.chatName || ChatType.BROADCAST
          : partner?.name || formatInternationalPhoneNumber(String(partner?.number)).international || "Unknown";
        
        const messageBody = getMessagePreview(msg);
        
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const browserNotification = new Notification(messageTitle, {
            body: messageBody,
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

        showToast.success(messageTitle, {
          description: messageBody,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => openChatFromToast(),
          },
        });
      }
    });

    return () => {
      userChannel.unbind_all();
      userChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [status, session?.user?.id, pathname, router, setNewMessageData, setUpdateMessageStatus]);

  return null;
}
