import { pusher } from "@/lib/pusher"; // your pusher instance
import { IChat } from "@/models/Chat";
import { IMessage } from "@/models/Message";

interface SendPusherNotificationParams {
  userId: string;
  event: string;
  chat?: IChat;
  message?: IMessage;
}

export async function sendPusherNotification({ userId, event, chat, message}: SendPusherNotificationParams) {
    if (!userId || !event) return;

    await pusher.trigger(`user-${userId}`, event, {
      chat,
      message,
    });
}
