import mongoose, { Schema, Document, models } from "mongoose";
import { MessageStatus } from "@/types/messageStatus";
import { MessageType } from "@/types/messageType"; 
import { ChatParticipant, ChatParticipantSchema } from "./Chat";

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;   // the service user
  chatId: mongoose.Types.ObjectId; // the recipient
  to: string;                        // recipient phone number
  from: string;                      // sender phone number (user’s WhatsApp)
  message: string;
  waMessageId?: string;
  status: MessageStatus;
  type: MessageType; // optional
  tag: string;
  participants: ChatParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
  to: { type: String, required: true },
  from: { type: String, required: true },
  message: { type: String, required: true },
  waMessageId: { type: String },
  status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.Sent },
  type: { type: String, enum: Object.values(MessageType), default: MessageType.Text },
  tag: { type: String, }, // true if AI generated this message
  participants: { type: [ChatParticipantSchema], required: true },
}, { timestamps: true });

export const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);
