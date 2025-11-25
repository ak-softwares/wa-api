// /models/Message.ts
import mongoose, { Schema, models } from "mongoose";
import { IMessage, IContext } from "@/types/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatParticipantSchema } from "@/models/Chat";

// ---- Context Sub-Schema ----
const ContextSchema = new Schema<IContext>(
  {
    id: { type: String, required: true },
    from: { type: String },
    message: { type: String }
  },
  { _id: false } // ❗ important: prevents auto _id for subdocument
);

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
    context: { type: ContextSchema },
    tag: { type: String },
    aiUsageId: { type: String },
    participants: { type: [ChatParticipantSchema] },
  },
  { timestamps: true }
);

export const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);
