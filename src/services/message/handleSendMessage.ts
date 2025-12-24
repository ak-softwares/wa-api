import axios from "axios";
import { IMessage, MessageModel } from "@/models/Message";
import { MessageDTO, MessageStatus, WhatsAppPayload } from "@/types/MessageType";
import { ChatType } from "@/types/Chat";
import { ApiError } from "@/types/apiResponse";
import { MessagePayload } from "@/types/MessageType";
import { Types } from "mongoose";
import { getOrCreateChat } from "../webhook-helper/getOrCreateChat";
import { CREDIT_COST } from "../../lib/wallet/credits";
import { UsageLogModel } from "@/models/UsageLog";
import { consumeMessage } from "../../lib/wallet/consumeMessage";
import { commitCredits } from "../../lib/wallet/commitCredits";
import { refundCredits } from "../../lib/wallet/refundCredits";
import { IWaAccount } from "@/models/WaAccount";
import { IChat } from "@/models/Chat";
import { buildWhatsAppPayload } from "@/lib/messages/whatsappPayloadBuilder";

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
  // Local cache for chats to reduce DB calls
  const chatCache = new Map<string, IChat>();

  // ✅ Broadcast tag handling
  const finalTag =
    chatType === ChatType.BROADCAST
      ? tag
        ? `${tag},broadcast`
        : "broadcast"
      : tag;

  // ✅ Send to each participant
  for (const participant of participants) {
    let waMessageId: string | undefined;
    let status: MessageStatus = MessageStatus.Failed;
    let errorMessage: string | undefined;

    const COST = CREDIT_COST.SEND_TEXT;

    // 1️⃣ Create UsageLog (PENDING)
    const usageLog = await UsageLogModel.create({
      userId,
      waAccountId: waAccount._id,
      phoneNumber: participant.number,
      actionType: "SEND_TEXT",
      creditsUsed: 0,
      status: "PENDING",
    });

    // 2️⃣ Decide FREE or PAID
    let billingType: "FREE" | "PAID";

    try {
      const result = await consumeMessage(userId.toString(), COST);
      billingType = result.type as "FREE" | "PAID";
    } catch (err) {
      // No free quota + no credits
      await UsageLogModel.updateOne(
        { _id: usageLog._id },
        { status: "FAILED", error: "Insufficient credits" }
      );

      failedMessages.push({
        to: participant.number,
        error: "Insufficient credits",
      });

      throw new ApiError(402, "Insufficient credits");
      // continue; // move to next participant
    }

    try {
      const whatsAppPayload: WhatsAppPayload = buildWhatsAppPayload({
        messagePayload,
        participant: participant.number
      });

      const fbResponse = await axios.post(url, whatsAppPayload, { headers });
      waMessageId = fbResponse.data?.messages?.[0]?.id;
      status = waMessageId ? MessageStatus.Sent : MessageStatus.Failed;

      if (status === MessageStatus.Sent) {
        // Commit credits ONLY if PAID
        if (billingType === "PAID") {
          await commitCredits(userId.toString(), COST);
        }

        await UsageLogModel.updateOne(
          { _id: usageLog._id },
          {
            status: "SUCCESS",
            messageId: waMessageId,
            creditsUsed: billingType === "PAID" ? COST : 0,
          }
        );

      } else {
        throw new Error("WhatsApp send failed");
      }

    } catch (err: any) {
      errorMessage = err?.response?.data?.error?.message || "Send failed";
      status = MessageStatus.Failed;

      // Refund ONLY if PAID
      if (billingType === "PAID") {
        await refundCredits(userId.toString(), COST);
      }

      await UsageLogModel.updateOne(
        { _id: usageLog._id },
        {
          status: "FAILED",
          error: errorMessage || "WhatsApp send failed",
        }
      );
    }

    // Get or create chat using cache
    const chat: IChat | null = await getOrCreateChat({
      userId: userId,
      waAccountId: waAccount._id!,
      phone: participant.number,
      chatCache,
    });

    // ✅ Save individual message
    const dbMessage = await MessageModel.create({
      userId,
      chatId: chat?._id,
      to: participant.number,
      from: waAccount.phone_number_id,
      message: messagePayload.message,
      media: messagePayload.media,
      location: messagePayload.location,
      template: messagePayload.template,
      waMessageId,
      status,
      type: messagePayload.messageType,
      tag: finalTag,
      context,
    });

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
      template: messagePayload.template,
      status: MessageStatus.Sent,
      type: messagePayload.messageType,
      tag: finalTag,
    });
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
      message: primaryMessage,
      // messages: {
      //   sent: savedMessages,
      //   failed: failedMessages,
      // },
  };
  return result;
}
