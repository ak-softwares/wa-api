import axios from "axios";
import { MessageModel } from "@/models/Message";
import { MessageStatus, MessageType, WhatsAppPayload } from "@/types/MessageType";
import { ChatType } from "@/types/Chat";
import { ApiError } from "@/types/apiResponse";
import { MessagePayload } from "@/types/MessageType";
import { Types } from "mongoose";
import { getOrCreateChat } from "../apiHelper/getOrCreateChat";
import { IWaAccount } from "@/models/WaAccount";
import { ChatModel, IChat } from "@/models/Chat";
import { buildWhatsAppPayload } from "@/lib/messages/whatsappPayloadBuilder";
import { generateLastMessageText } from "@/lib/messages/generateLastMessageText";
import { getTemplateByName } from "../template/getTemplateByName";
import { ITemplate } from "@/models/Template";
import { replaceActualTemplateValue } from "@/lib/mapping/replaceActualTemplateValue";
import { TemplatePayload } from "@/types/Template";

interface HandleSendMessageParams {
  messagePayload: MessagePayload;
  userId: Types.ObjectId;
  waAccount: IWaAccount;
}

// Send a WhatsApp message via Cloud API and save in DB
export async function handleSendMessage({
  messagePayload,
  userId,
  waAccount,
}: HandleSendMessageParams) {
  const { participants, context, chatType, tag } = messagePayload;

  // ✅ Basic validation
  if (!messagePayload.participants || messagePayload.participants.length === 0) { // TODO: remove after makeing all
    throw new ApiError(400, "Participants are required");
  }
  
  if (!messagePayload.messageType) {
    throw new ApiError(400, "Message type is required");
  }

  const isBroadcast = chatType === ChatType.BROADCAST;
  if (isBroadcast && !messagePayload.chatId) {
    throw new ApiError(400, "broadcastId is required when chatType is BROADCAST");
  }

  const url = `https://graph.facebook.com/v23.0/${waAccount.phone_number_id}/messages`;
  const headers = {
    Authorization: `Bearer ${waAccount.permanent_token}`,
    "Content-Type": "application/json",
  };

  const savedMessages = [];
  const failedMessages = [];
  let singleChat: IChat | null = null;
  // Local cache for chats to reduce DB calls
  const chatCache = new Map<string, IChat>();

  // ✅ Broadcast tag handling
  const finalTag =
    chatType === ChatType.BROADCAST
      ? tag
        ? `${tag},broadcast`
        : "broadcast"
      : tag;

  const isTemplate = messagePayload.messageType === MessageType.TEMPLATE;
  let template: ITemplate | undefined = undefined;
  if(isTemplate) {
    const metaTemplate: ITemplate = await getTemplateByName({ templateName: messagePayload.template?.name!, waAccount });
    template = replaceActualTemplateValue({metaTemplate: metaTemplate, messagePayload: messagePayload.template! as TemplatePayload});
  }

  // ✅ Send to each participant
  for (const participant of participants) {
    let waMessageId: string | undefined;
    let status: MessageStatus = MessageStatus.Failed;
    let errorMessage: string | undefined;

    try {
      const whatsAppPayload: WhatsAppPayload = buildWhatsAppPayload({
        messagePayload,
        participant: participant.number,
        waAccount,
      });

      const fbResponse = await axios.post(url, whatsAppPayload, { headers });
      waMessageId = fbResponse.data?.messages?.[0]?.id;
      status = waMessageId ? MessageStatus.Sent : MessageStatus.Failed;

      if (status === MessageStatus.Failed) {
        throw new Error("WhatsApp send failed");
      }
    } catch (err: any) {
      errorMessage = err?.response?.data?.error?.message || err.message || "Send failed";
      status = MessageStatus.Failed;

      // 🚨 If single participant AND chat type is CHAT → return error
      if (participants.length === 1 && !isBroadcast) {
        throw new ApiError(400, errorMessage || "Failed to send message");
      }

      // Otherwise continue to next participant
      continue;
    }

    // Get or create chat using cache
    const chat: IChat | null = await getOrCreateChat({
      userId: userId,
      waAccountId: waAccount._id!,
      phone: participant.number,
      chatCache,
    });
    
    // ✅ Only store chat if exactly ONE participant
    if (!isBroadcast && participants.length === 1) {
      singleChat = chat;
    }

    // ✅ Save individual message
    const dbMessage = await MessageModel.create({
      userId,
      chatId: chat?._id,
      to: participant.number,
      from: waAccount.phone_number_id,
      message: messagePayload.message,
      media: messagePayload.media,
      location: messagePayload.location,
      template,
      waMessageId,
      status,
      type: messagePayload.messageType,
      tag: finalTag,
      context,
    });


    // handle lastMessage
    const updateFields: Partial<IChat> = {
      lastMessage: generateLastMessageText(messagePayload),
      lastMessageAt: new Date(),
    };
    await ChatModel.updateOne({ _id: chat?._id }, { $set: updateFields });
    status === MessageStatus.Sent ? savedMessages.push(dbMessage) : failedMessages.push(dbMessage);
  }

  // ✅ Save broadcast master message (ONE extra record)
  let broadcastMasterMessage = null;
  if (isBroadcast) {
    broadcastMasterMessage = await MessageModel.create({
      userId,
      chatId: messagePayload.chatId,
      to: ChatType.BROADCAST,
      participants,
      from: waAccount.phone_number_id,
      message: messagePayload.message,
      media: messagePayload.media,
      location: messagePayload.location,
      template,
      status: MessageStatus.Sent,
      type: messagePayload.messageType,
      tag: finalTag,
    });
    // handle lastMessage
    const updateFields: Partial<IChat> = {
      lastMessage: generateLastMessageText(messagePayload),
      lastMessageAt: new Date(),
    };
    await ChatModel.updateOne({ _id: messagePayload.chatId }, { $set: updateFields });
  }

  const primaryMessage =
      isBroadcast
        ? broadcastMasterMessage
        : savedMessages.length > 0
          ? savedMessages[savedMessages.length - 1] // latest sent
          : failedMessages[failedMessages.length - 1]; // latest failed

  const result = {
      sent: savedMessages.length,
      failed: failedMessages.length,
      chat: singleChat,
      message: primaryMessage,
      // messages: {
      //   sent: savedMessages,
      //   failed: failedMessages,
      // },
  };
  return result;
}
