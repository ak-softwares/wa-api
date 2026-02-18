import axios from "axios";
import { IMessage, MessageModel } from "@/models/Message";
import { MessageStatus, MessageType, WhatsAppPayload } from "@/types/MessageType";
import { ChatType } from "@/types/Chat";
import { ApiError } from "@/types/apiResponse";
import { MessagePayload } from "@/types/MessageType";
import { Types } from "mongoose";
import { getOrCreateChat } from "../apiHelper/getOrCreateChat";
import { IWaAccount } from "@/models/WaAccount";
import { ChatModel, IChat } from "@/models/Chat";
import { buildWhatsAppPayload } from "@/lib/messages/whatsappPayloadBuilder";
import { extractMessageText } from "@/lib/messages/extractMessageText";
import { getTemplateByName } from "../template/getTemplateByName";
import { ITemplate } from "@/models/Template";
import { replaceActualTemplateValue } from "@/lib/mapping/replaceActualTemplateValue";
import { TemplatePayload } from "@/types/Template";
import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import { checkMessageCreditsAvailability } from "../wallet/checkMessageCreditsAvailability";

interface HandleSendMessageParams {
  messagePayload: MessagePayload;
  userId: Types.ObjectId;
  waAccount: IWaAccount;
  isCreditAlreadyCheck?: boolean,
}

// Send a WhatsApp message via Cloud API and save in DB
export async function handleSendMessage({
  messagePayload,
  userId,
  waAccount,
  isCreditAlreadyCheck = false,
}: HandleSendMessageParams) {
  const { participants, context, chatType, tag } = messagePayload;

  // ✅ only check (no debit here)
  if (!isCreditAlreadyCheck) {
    const creditCheck = await checkMessageCreditsAvailability({ userId, credits: participants.length });
    if (!creditCheck.allowed) {
      throw new ApiError(402, "Insufficient credits");
    }
  }

  // ✅ Basic validation
  if (!messagePayload.participants || messagePayload.participants.length === 0) {
    throw new ApiError(400, "Participants are required");
  }
  
  if (!messagePayload.messageType) {
    throw new ApiError(400, "Message type is required");
  }

  const isBroadcast = chatType === ChatType.BROADCAST;
  if (isBroadcast && !messagePayload.chatId) {
    throw new ApiError(400, "broadcastId is required when chatType is BROADCAST");
  }

  const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${waAccount.phone_number_id}/messages`;
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
    // console.log(JSON.stringify(messagePayload.template, null, 2))
    const metaTemplate: ITemplate = await getTemplateByName({ templateName: messagePayload.template?.name!, waAccount });
    template = replaceActualTemplateValue({metaTemplate: metaTemplate, messagePayload: messagePayload.template! as TemplatePayload});
  }

  // ============================================================
  // ✅ BROADCAST MASTER MESSAGE (Create FIRST)
  // ============================================================
  let broadcastMasterMessage: IMessage | null = null;

  if (isBroadcast) {
    broadcastMasterMessage = await MessageModel.create({
      userId,
      chatId: messagePayload.chatId,
      waAccountId: waAccount._id!,
      isBroadcastMaster: true,
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

    // Update broadcast chat lastMessage ONCE
    const updateFields: Partial<IChat> = {
      lastMessage: extractMessageText(messagePayload),
      lastMessageAt: new Date(),
    };

    await ChatModel.updateOne(
      { _id: messagePayload.chatId },
      { $set: updateFields }
    );
  }

  // ============================================================
  // ✅ SEND TO EACH PARTICIPANT
  // ============================================================
  for (const participant of participants) {
    let waMessageId: string | undefined;
    let status: MessageStatus = MessageStatus.Failed;
    let errorMessage: string | undefined;

    try {
      const whatsAppPayload: WhatsAppPayload = buildWhatsAppPayload({
        messagePayload,
        participant: participant,
      });

      const fbResponse = await axios.post(url, whatsAppPayload, { headers });
      waMessageId = fbResponse.data?.messages?.[0]?.id;
      status = waMessageId ? MessageStatus.Sent : MessageStatus.Failed;
      // console.log("response: " + JSON.stringify(fbResponse.data, null, 2))
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
    
    // ============================================================
    // ✅ CHAT TYPE: create/get chat and save normal message
    // ============================================================
    let chat: IChat | null = null;
    if (!isBroadcast) {
      chat = await getOrCreateChat({
        userId,
        waAccountId: waAccount._id!,
        participant,
        chatCache,
      });
    }

    // ✅ Only store chat if exactly ONE participant
    if (!isBroadcast && participants.length === 1) {
      singleChat = chat;
    }

    // ✅ Save individual message
    const dbMessage = await MessageModel.create({
      userId,
      chatId: isBroadcast ? messagePayload.chatId : chat?._id,
      waAccountId: waAccount._id!,
      isBroadcastMaster: isBroadcast ? false : undefined,
      parentMessageId: broadcastMasterMessage ? broadcastMasterMessage?._id : undefined,  // 👇 link to master message for report
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

    if (!isBroadcast && chat?._id) {
      // handle lastMessage
      const updateFields: Partial<IChat> = {
        lastMessage: extractMessageText(messagePayload),
        lastMessageAt: new Date(),
      };
      await ChatModel.updateOne({ _id: chat._id }, { $set: updateFields });
    }
    status === MessageStatus.Sent ? savedMessages.push(dbMessage) : failedMessages.push(dbMessage);
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
