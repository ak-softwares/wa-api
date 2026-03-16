import { IMessage } from "@/models/Message";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { NotificationEventType } from "@/utiles/enums/notification";
import { IChat } from "@/models/Chat";

export type INotificationPayload = {
  chat?: IChat;
  message?: IMessage;
  eventType: NotificationEventType;
};

export type NotificationPayload = {
  chat?: Chat;
  message?: Message;
  eventType: NotificationEventType;
};