import { MessagePaylaod } from "@/types/MessagePayload";
import { MessageType } from "@/types/MessageType";
import { handelSendTextMessage } from "./handelSendTextMessage";
import { Types } from "mongoose";
import { WaAccount } from "@/types/WaAccount";
import { ApiError } from "@/types/apiResponse";

interface HandleSendMessageParams {
  messagePayload: MessagePaylaod;
  userId: Types.ObjectId;
  waAccount: WaAccount;
}

export async function handleSendMessage({
  messagePayload: messagePayload,
  userId,
  waAccount,
}: HandleSendMessageParams) {
  // ✅ Basic validation
  if (!messagePayload.participants || messagePayload.participants.length === 0) { // TODO: remove after makeing all
    throw new ApiError(400, "Participants are required");
  }

  if (!messagePayload.messageType) {
    throw new ApiError(400, "Message type is required");
  }

  switch (messagePayload.messageType) {
    case MessageType.TEXT:
      return await handelSendTextMessage({ messagePayload, userId, waAccount });

    case MessageType.TEMPLATE:
      if (!messagePayload.template) {
        throw new Error("Template data is required");
      }
      break;

    case MessageType.MEDIA:
      if (!messagePayload.media) {
        throw new Error("Media data is required");
      }
      break;

    case MessageType.LOCATION:
      if (!messagePayload.location) {
        throw new Error("Location data is required");
      }
      break;

    default:
      throw new ApiError(400, "Unsupported message type");
  }
}
