import { Media, MediaType } from "@/utiles/enums/mediaTypes";
import { ChatParticipant, ChatType } from "./Chat";
import { Template, TemplatePayload } from "./Template";
import { Context, LocationType } from "./Message";

export enum MessageType {
  TEXT = "text",
  MEDIA = "media",
  LOCATION = "location",
  TEMPLATE = "template",
  STICKER = "sticker"
}

export enum MessageStatus {
  Sent = "sent",
  Pending = "pending",
  Delivered = "delivered",
  Read = "read",
  Failed = "failed",
  Received = "received",
}

export enum IncomingMessageType {
  TEXT = "text",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  DOCUMENT = "document",
  STICKER = "sticker",
  LOCATION = "location",
  CONTACTS = "contacts",
  INTERACTIVE = "interactive",
  BUTTON = "button",
  REACTION = "reaction",
  UNSUPPORTED = "unsupported",
  SYSTEM = "system"
}

export type MessagePayload = {
  participants: ChatParticipant[];
  messageType: MessageType;
  message?: string;
  template?: Template | TemplatePayload;
  media?: Media;
  location?: LocationType;
  context?: Context;
  chatType?: ChatType;
  chatId?: string;
  tag?: string;
}

// types/MessageDTO.ts Data Transfer Object
export interface MessageDTO {
  _id: string;
  userId: string;
  chatId: string;
  to: string;
  from: string;
  message?: string;
  type: MessageType;
  status: MessageStatus;
  waMessageId?: string;
  createdAt: string;
}

// whatsapp.types.ts
export type WhatsAppPayload = {
  messaging_product: "whatsapp";
  to: string;
  type: string;
  text?: { body: string };
  context?: { message_id: string };
  [key: string]: any;
};

export type MediaSelection = {
  type: MediaType;
  file?: File;
}