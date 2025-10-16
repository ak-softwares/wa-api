import mongoose, { Schema, Document, models } from "mongoose";

export interface ChatParticipant {
  number: string;
  name?: string;
  imageUrl?: string;
}

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  participants: ChatParticipant[];
  type: "single" | "broadcast";
  chatName?: string;
  chatImage?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatParticipantSchema = new Schema<ChatParticipant>(
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
    participants: { type: [ChatParticipantSchema], required: true },
    type: {
      type: String,
      enum: ["single", "broadcast"],
      default: "single",
      required: true,
    },
    chatName: { type: String, trim: true },
    chatImage: { type: String, trim: true },
    lastMessage: { type: String, trim: true },
    lastMessageAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 🔍 Indexes for faster lookup
// ChatSchema.index({ userId: 1, type: 1 });
ChatSchema.index({ userId: 1, "participants.number": 1 });

// ✅ Prevent model overwrite during hot reload
export const Chat = models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
