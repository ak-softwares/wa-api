// /types/Message.ts
import { Types } from "mongoose";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatParticipant } from "@/types/Chat";
import { Template } from "./Template";

export interface IContext {
  id: string;
  from?: string;
  message?: string;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type Context = IContext;

export interface IMessage {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  to: string;
  from: string;
  message?: string;
  template?: Template;
  waMessageId?: string;
  status?: MessageStatus;
  type?: MessageType;
  context?: Context;
  tag?: string;
  participants?: ChatParticipant[];
  
  // MEDIA TYPES
  image?: Media;
  video?: Media;
  document?: Media;
  audio?: Media;
  sticker?: Media;

  // LOCATION
  location?: Location;
  
  aiUsageId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type Message = IMessage;

export interface Media {
  id?: string;       // media_id from WhatsApp
  link?: string;     // public URL
  caption?: string;  // only for image/video/document
  filename?: string; // only for document
  mimeType?: string; // optional - saved on upload
  size?: number;     // optional - file size
}

export interface Location {
  latitude: string;
  longitude: string;
  name?: string;
  address?: string;
}
