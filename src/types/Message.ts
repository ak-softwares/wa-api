// /types/Message.ts
import { MessageStatus } from "./MessageType";
import { MessageType } from "@/types/MessageType";
import { ChatParticipant } from "@/types/Chat";
import { Template } from "./Template";
import { Media } from "@/utiles/enums/mediaTypes";

export type Context = {
  id: string;
  from?: string;
  message?: string;
}

export type LocationType = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export type Message = {
  _id?: string;
  userId: string;
  chatId: string;
  waAccountId?: string;
  parentMessageId?: string;
  to: string;
  from: string;
  message?: string;
  template?: Template;
  media?: Media;
  location?: LocationType;
  waMessageId?: string;
  status?: MessageStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  type?: MessageType;
  context?: Context;
  tag?: string;
  participants?: ChatParticipant[];
  aiUsageId?: string;
  isCreditDebited?: boolean,
  isBroadcastMaster?: boolean;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}
