import mongoose, { Schema, Document, models } from "mongoose";

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;       // The service user (owner of this chat)
  participants: string[];                // Phone numbers or waIds
  lastMessage?: string;                  // Cached last message
  lastMessageAt?: Date;                  // Cached last message timestamp
  unreadCount?: number;                  // Optional for future unread badge
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: String, required: true, trim: true }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Avoid model overwrite on hot reload
export const Chat = models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
