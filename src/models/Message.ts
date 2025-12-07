// /models/Message.ts
import mongoose, { Schema, models } from "mongoose";
import { IMessage, IContext, Media, Location } from "@/types/Message";
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

// ---- Media Sub-Schema ----
const MediaSchema = new Schema<Media>(
  {
    id: { type: String },        // media_id from WhatsApp
    link: { type: String },      // public URL
    caption: { type: String },   // allowed for image/video/document
    filename: { type: String },  // only for documents
    mimeType: { type: String },
    size: { type: Number }
  },
  { _id: false }
);

// ---- Location Sub-Schema ----
const LocationSchema = new Schema<Location>(
  {
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    name: { type: String },
    address: { type: String }
  },
  { _id: false }
);

// ---- Main Message Schema ----
const MessageSchema = new Schema<IMessage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    to: { type: String, required: true },
    from: { type: String, required: true },
    message: { type: String },
    template: { type: Schema.Types.Mixed },
    waMessageId: { type: String },
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.Sent,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    image: { type: MediaSchema },
    video: { type: MediaSchema },
    document: { type: MediaSchema },
    audio: { type: MediaSchema },
    sticker: { type: MediaSchema },
    location: { type: LocationSchema },
    context: { type: ContextSchema },
    tag: { type: String },
    aiUsageId: { type: String },
    participants: { type: [ChatParticipantSchema] },
  },
  { timestamps: true }
);

export const Message = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

