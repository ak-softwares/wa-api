// /types/Chat.ts
import { Types } from "mongoose";

export interface IChatParticipant {
  number: string;
  name?: string;
  imageUrl?: string;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type ChatParticipant = IChatParticipant;

export interface IChat {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  participants: IChatParticipant[];
  type: "single" | "broadcast";
  chatName?: string;
  chatImage?: string;
  isFavourite?: boolean
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type Chat = IChat;