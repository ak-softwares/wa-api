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

export type Location = {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export type Message = {
  _id?: string;
  userId: string;
  chatId: string;
  to: string;
  from: string;
  message?: string;
  template?: Template;
  media?: Media;
  location?: Location;
  waMessageId?: string;
  status?: MessageStatus;
  type?: MessageType;
  context?: Context;
  tag?: string;
  participants?: ChatParticipant[];
  aiUsageId?: string;
  createdAt?: string;
  updatedAt?: string;
}
