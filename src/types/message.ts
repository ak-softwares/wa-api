import { MessageStatus } from "./messageStatus";
import { MessageType } from "./messageType";

export type IMessage = {
  _id: string;
  userId: string;        // the service user
  chatId: string;     // the recipient
  to: string;            // recipient phone number
  from: string;          // sender phone number (user’s WhatsApp)
  message: string;
  waMessageId?: string;
  status: MessageStatus;
  type: MessageType;
  createdAt: string;     // ISO date string
  updatedAt: string;     // ISO date string
};
