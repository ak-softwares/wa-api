import { pusher } from "@/lib/pusher"; // your pusher instance
import { Chat } from "@/types/Chat";
import { Message } from "@/types/Message";

interface SendPusherNotificationParams {
  userId: string;
  event: string;
  chat?: Chat;
  message?: Message;
}

export async function sendPusherNotification({ userId, event, chat, message}: SendPusherNotificationParams) {
    if (!userId || !event) return;

    await pusher.trigger(`user-${userId}`, event, {
      chat,
      message,
    });
}
