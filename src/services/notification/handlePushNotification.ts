import { IChat } from "@/models/Chat";
import { IMessage } from "@/models/Message";
import { sendMobileNotification } from "./sendMobileNotification";
import { sendWebNotification } from "./sendWebNotification";
import { Types } from "mongoose";

interface HandlePushNotificationParams {
  userId: Types.ObjectId;
  webEvent?: string;
  chat?: IChat;
  message?: IMessage;
}

export function handlePushNotification({
  userId,
  webEvent,
  chat,
  message,
}: HandlePushNotificationParams) {
  if (!userId) return;

  void Promise.allSettled([
    sendWebNotification({ userId, event: webEvent ?? "new-message", chat, message }),
    sendMobileNotification({ userId, chat, message }),
  ]);
}
