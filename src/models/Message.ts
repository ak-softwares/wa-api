// /models/Message.ts
import mongoose, { Schema, models } from "mongoose";
import { IMessage } from "@/types/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatParticipantSchema } from "@/models/Chat";

const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    to: { type: String, required: true },
    from: { type: String, required: true },
    message: { type: String, required: true },
    waMessageId: { type: String },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.Sent,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.Text,
    },
    tag: { type: String },
    participants: { type: [ChatParticipantSchema], required: true },
  },
  { timestamps: true }
);

export const Message =
  models.Message || mongoose.model<IMessage>("Message", MessageSchema);
