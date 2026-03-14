import { pusher } from "@/lib/pusher";
import { IChat } from "@/models/Chat";
import { IMessage } from "@/models/Message";
import { Types } from "mongoose";

interface SendWebNotificationParams {
  userId: Types.ObjectId;
  event: string;
  chat?: IChat;
  message?: IMessage;
}

export async function sendWebNotification({ userId, event, chat, message }: SendWebNotificationParams) {
  if (!userId || !event) return;

  await pusher.trigger(`user-${userId.toString()}`, event, {
    chat,
    message,
  });
}
