import axios from "axios";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatType, IChat } from "@/types/Chat";
import { ApiError } from "@/types/apiResponse";
import { MessagePaylaod } from "@/types/MessagePayload";
import { Types } from "mongoose";
import { WaAccount } from "@/types/WaAccount";
import { getOrCreateChat } from "../webhook-helper/getOrCreateChat";
import { CREDIT_COST } from "../wallet/credits";
import { UsageLog } from "@/models/UsageLog";
import { consumeMessage } from "../wallet/consumeMessage";
import { commitCredits } from "../wallet/commitCredits";
import { refundCredits } from "../wallet/refundCredits";

interface HandelSendTextMessageParams {
  messagePayload: MessagePaylaod;
  userId: Types.ObjectId;
  waAccount: WaAccount;
}

// Send a WhatsApp message via Cloud API and save in DB
export async function handelSendTextMessage({
  messagePayload,
  userId,
  waAccount,
}: HandelSendTextMessageParams) {
  const { participants, message, context, chatType, tag } = messagePayload;

  if (!message) {
    throw new ApiError(400, "Message text is required");
  }
  
  if (chatType === ChatType.BROADCAST && !messagePayload.chatId) {
    throw new ApiError(400, "broadcastId is required when chatType is BROADCAST");
  }

  const url = `https://graph.facebook.com/v23.0/${waAccount.phone_number_id}/messages`;
  const headers = {
    Authorization: `Bearer ${waAccount.permanent_token}`,
    "Content-Type": "application/json",
  };

  const savedMessages = [];
  const failedMessages = [];
  const contextId: string | undefined = context?.id;
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
    const usageLog = await UsageLog.create({
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
      await UsageLog.updateOne(
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
      const payload = {
        messaging_product: "whatsapp",
        to: participant.number,
        type: "text",
        text: { body: message },
        ...(contextId && {
          context: { message_id: contextId },
        }),
      };

      const fbResponse = await axios.post(url, payload, { headers });
      waMessageId = fbResponse.data?.messages?.[0]?.id;
      status = waMessageId ? MessageStatus.Sent : MessageStatus.Failed;

      if (status === MessageStatus.Sent) {
        // Commit credits ONLY if PAID
        if (billingType === "PAID") {
          await commitCredits(userId.toString(), COST);
        }

        await UsageLog.updateOne(
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

      await UsageLog.updateOne(
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
    const dbMessage = await Message.create({
      userId,
      chatId: chat?._id,
      to: participant.number,
      from: waAccount.phone_number_id,
      message,
      waMessageId,
      status,
      type: MessageType.TEXT,
      tag: finalTag,
      context,
    });

    status === MessageStatus.Sent ? savedMessages.push(dbMessage) : failedMessages.push(dbMessage);
  }

  // ✅ Save broadcast master message (ONE extra record)
  if (chatType === ChatType.BROADCAST) {
    await Message.create({
      userId,
      chatId: messagePayload.chatId,
      to: ChatType.BROADCAST,
      participants,
      from: waAccount.phone_number_id,
      message,
      status: MessageStatus.Sent,
      type: MessageType.TEXT,
      tag: finalTag,
    });
  }

  const result = {
      sent: savedMessages.length,
      failed: failedMessages.length,
      messages: {
        sent: savedMessages,
        failed: failedMessages,
      },
  };
  return result;
}
