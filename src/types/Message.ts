// /types/Message.ts
import { Types } from "mongoose";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatParticipant } from "@/types/Chat";

export interface IContext {
  id: string;
  from?: string;
  message?: string;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type Context = IContext;

export interface IMessage {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  to: string;
  from: string;
  message: string;
  waMessageId?: string;
  status?: MessageStatus;
  type?: MessageType;
  context?: Context;
  tag?: string;
  participants: ChatParticipant[];
  aiUsageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type Message = IMessage;
