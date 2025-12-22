// /types/Message.ts
import { MessageType } from "@/types/MessageType";
import { ChatParticipant, ChatType } from "@/types/Chat";
import { Template } from "./Template";
import { Media } from "@/utiles/enums/mediaTypes";
import { Context } from "./Message";
import { Types } from "mongoose";

export interface IMessagePaylaod {
  participants: ChatParticipant[];
  messageType: MessageType;
  message?: string;
  template?: Template;
  media?: Media;
  location?: Location;
  context?: Context;
  chatType?: ChatType;
  chatId?: Types.ObjectId;
  tag?: string;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type MessagePaylaod = IMessagePaylaod;
