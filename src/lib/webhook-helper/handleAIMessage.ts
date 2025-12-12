import { IChat } from "@/types/Chat";
import { IWaAccount } from "@/types/WaAccount";
import { sendToAIAgent } from "../ai/webhookService";
import { getAIReply } from "../ai/aiService";
import { sendWhatsAppMessage } from "../messages/sendWhatsAppMessage";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";

interface HandleAIMessageArgs {
  userId: string; // User document
  wa: IWaAccount;
  chat: IChat; // Chat document
  change: any; // Single messages payload
  rowMessageJson: any; // Single message payload
}

export async function handleAIMessage({
  userId,
  wa,
  chat,
  change,
  rowMessageJson,
}: HandleAIMessageArgs) {

  const sender_name = change.value?.contacts?.[0]?.profile?.name || "";
  const phone_number_id = change.value?.metadata?.phone_number_id;
  const from = rowMessageJson.from;

  // AI agent via webhook
  if (wa.aiAgent?.isActive && wa.aiAgent?.webhookUrl) {
    await sendToAIAgent({
      webhookUrl: wa.aiAgent.webhookUrl,
      payload: change, // single message payload
      prompt: wa.aiAgent.prompt,
      user_name: sender_name,
      user_phone: from,
    });
  }
  // AI chat directly
  else if (wa.aiChat?.isActive) {
    const { aiGeneratedReply, aiUsageId } = await getAIReply({
      userId: userId,
      prompt: wa.aiChat?.prompt ?? "",
      chat,
      phone_number_id,
      user_name: sender_name,
      user_phone: from,
    });

    if (aiGeneratedReply) {
      const { newMessage: aiMessage, waMessageId, errorResponse: sendMsgError } = await sendWhatsAppMessage({
        userId: userId,
        chatId: chat._id!.toString(),
        phone_number_id,
        permanent_token: wa.permanent_token,
        to: from,
        message: aiGeneratedReply,
        tag: "aichat",
        aiUsageId,
      });

      if (waMessageId) {
        // Trigger message for specific user (listener)
        await sendPusherNotification({
          userId: userId,
          event: "new-message",
          chat,
          message: aiMessage,
        });
      }
    }
  }
}
