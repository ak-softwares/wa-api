// /types/Message.ts
import { Types } from "mongoose";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatParticipant } from "@/types/Chat";

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
  tag?: string;
  participants: ChatParticipant[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type Message = IMessage;
