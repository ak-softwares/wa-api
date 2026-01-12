// /models/Message.ts
import mongoose, { Schema, Types, models } from "mongoose";
import { MessageStatus } from "@/types/MessageType";
import { MessageType } from "@/types/MessageType";
import { ChatParticipantSchema } from "@/models/Chat";
import { ChatParticipant } from "@/types/Chat";
import { MediaType } from "@/utiles/enums/mediaTypes";
import { ITemplate } from "./Template";

export interface IMedia {
  id?: string;       // media_id from WhatsApp
  link?: string;     // public URL
  caption?: string;  // only for image/video/document
  filename?: string; // only for document
  mediaType?: MediaType;
  voice?: boolean;
}

export interface IContext {
  id: string;
  from?: string;
  message?: string;
}

export interface ILocation {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface IMessage {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  to: string;
  from: string;
  message?: string;
  template?: ITemplate;
  media?: IMedia;
  location?: ILocation;
  waMessageId?: string;
  status?: MessageStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  type?: MessageType;
  context?: IContext;
  tag?: string;
  participants?: ChatParticipant[];
  aiUsageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
const MediaSchema = new Schema<IMedia>(
  {
    id: { type: String },        // media_id from WhatsApp
    link: { type: String },      // public URL
    caption: { type: String },   // allowed for image/video/document
    filename: { type: String },  // only for documents
    mediaType: { type: String },
  },
  { _id: false }
);

// ---- Location Sub-Schema ----
const LocationSchema = new Schema<ILocation>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
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
    // 🔹 STATUS TIMESTAMPS
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    readAt: { type: Date },
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.TEXT,
    },
    media: { type: MediaSchema },
    location: { type: LocationSchema },
    context: { type: ContextSchema },
    tag: { type: String },
    aiUsageId: { type: String },
    participants: { type: [ChatParticipantSchema] },
  },
  { timestamps: true }
);

export const MessageModel = models.Message || mongoose.model<IMessage>("Message", MessageSchema);

