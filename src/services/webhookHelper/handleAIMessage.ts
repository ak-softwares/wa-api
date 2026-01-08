import { IChat } from "@/models/Chat";
import { IWaAccount } from "@/models/WaAccount";
import { sendToAIAgent } from "@/services/ai/webhookService";
import { getAIReply } from "@/services/ai/aiService";
import { sendMessage } from "../message/sendMessage";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { handleSendMessage } from "../message/handleSendMessage";
import { MessageType } from "@/types/MessageType";
import { Types } from "mongoose";

interface HandleAIMessageArgs {
  userId: Types.ObjectId; // User document
  waAccount: IWaAccount;
  chat: IChat; // Chat document
  change: any; // Single messages payload
  rowMessageJson: any; // Single message payload
}

export async function handleAIMessage({
  userId,
  waAccount,
  chat,
  change,
  rowMessageJson,
}: HandleAIMessageArgs) {

  const sender_name = change.value?.contacts?.[0]?.profile?.name || "";
  const phone_number_id = change.value?.metadata?.phone_number_id;
  const from = rowMessageJson.from;

  // AI agent via webhook
  if (waAccount.aiAgent?.isActive && waAccount.aiAgent?.webhookUrl) {
    await sendToAIAgent({
      webhookUrl: waAccount.aiAgent.webhookUrl,
      payload: change, // single message payload
      prompt: waAccount.aiAgent.prompt,
      user_name: sender_name,
      user_phone: from,
    });
  }
  // AI chat directly
  else if (waAccount.aiChat?.isActive) {
    const { aiGeneratedReply, aiUsageId } = await getAIReply({
      userId: userId,
      prompt: waAccount.aiChat?.prompt ?? "",
      chat,
      phone_number_id,
      user_name: sender_name,
      user_phone: from,
    });

    if (aiGeneratedReply) {
      const messagePayload = {
        participants: [{ number: from }],
        messageType: MessageType.TEXT,
        message: aiGeneratedReply,
        tag: "aichat",
      };
      const result = await handleSendMessage({
        messagePayload,
        userId: userId,
        waAccount
      });

      if (result.sent > 0 && result.message) {
        // Trigger message for specific user (listener)
        await sendPusherNotification({
          userId: userId.toString(),
          event: "new-message",
          chat,
          message: result.message,
        });
      }
    }
  }
}
