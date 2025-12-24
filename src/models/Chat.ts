import mongoose, { Schema, Types, models } from "mongoose";
import { ChatType } from "@/types/Chat";

export interface IChatParticipant {
  number: string;
  name?: string;
  imageUrl?: string;
}

export interface IChat {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  participants: IChatParticipant[];
  type: ChatType;
  chatName?: string;
  chatImage?: string;
  isFavourite?: boolean
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ChatParticipantSchema = new Schema<IChatParticipant>(
  {
    number: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
  },
  { _id: false }
);

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccount", required: true },
    participants: { type: [ChatParticipantSchema], required: true },
    type: {
      type: String,
      enum: Object.values(ChatType),
      default: ChatType.CHAT,
      required: true,
    },
    chatName: { type: String, trim: true },
    chatImage: { type: String, trim: true },
    isFavourite: { type: Boolean, default: false },
    lastMessage: { type: String, trim: true },
    lastMessageAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index
ChatSchema.index({ userId: 1, "participants.number": 1 });

// Prevent overwrite in dev
export const ChatModel = models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
