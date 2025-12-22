// /models/Chat.ts
import mongoose, { Schema, models } from "mongoose";
import { ChatType, IChat, IChatParticipant } from "@/types/Chat";

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
export const Chat = models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
