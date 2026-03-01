import { IChat } from "@/models/Chat";
import { IWaAccount } from "@/models/WaAccount";
import { webhookHandler } from "@/services/ai/webhookTool/webhookService";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { handleSendMessage } from "../message/handleSendMessage";
import { MessageType } from "@/types/MessageType";
import { Types } from "mongoose";
import { ToolModel } from "@/models/Tool";
import { getReplyFromChatAgent } from "../ai/aiSDK/agents/chatAgent";
import { messageHistory } from "../message/messageHistory";
import { IMessage } from "@/models/Message";
import { checkMessageCreditsAvailability } from "../wallet/checkMessageCreditsAvailability";
import { IUser } from "@/models/User";

interface HandleAIMessageArgs {
  user: IUser; // User document
  waAccount: IWaAccount;
  chat: IChat; // Chat document
  change: any; // Single messages payload
  rowMessageJson: any; // Single message payload
}

export async function handleAIMessage({
  user,
  waAccount,
  chat,
  change,
  rowMessageJson,
}: HandleAIMessageArgs) {

  const sender_name = change.value?.contacts?.[0]?.profile?.name || "";
  const phone_number_id = change.value?.metadata?.phone_number_id;
  const from = rowMessageJson.from;

  // ✅ 2) Check webhook tool
  const webhookTool = await ToolModel.findOne({
    userId: user._id,
    waAccountId: waAccount._id,
    id: "webhook",
    active: true,
  });

  // AI agent via webhook
  if (webhookTool?.credentials?.webhookUrl) {
    await webhookHandler({
      webhookUrl: webhookTool.credentials.webhookUrl,
      payload: change, // single message payload
      prompt: user.aiAssistant?.prompt,
      user_name: sender_name,
      user_phone: from,
    });
  }

  // AI assistant directly
  if (user.aiAssistant?.isActive) {
    // ✅ only check (no debit here)
    const creditCheck = await checkMessageCreditsAvailability({ userId: user._id, credits: 1 });
    if (!creditCheck.allowed) return;

    const messages: IMessage[] = await messageHistory({ chatId: chat._id!, length: 20 });
    const systemPrompt = user.aiAssistant?.prompt ?? "";

    const { aiGeneratedReply } = await getReplyFromChatAgent({
      userId: user._id,
      systemPrompt: systemPrompt,
      messages,
      phone_number_id,
      user_name: sender_name,
      user_phone: from,
    });

    if (aiGeneratedReply) {
      const messagePayload = {
        participants: [{ number: from }],
        messageType: MessageType.TEXT,
        message: aiGeneratedReply,
        tag: "aiAssistant",
      };
      const result = await handleSendMessage({
        messagePayload,
        userId: user._id,
        waAccount,
        isCreditAlreadyCheck: true,
      });

      if (result.sent > 0 && result.message) {
        // Trigger message for specific user (listener)
        await sendPusherNotification({
          userId: user._id.toString(),
          event: "new-message",
          chat,
          message: result.message,
        });
      }
    }
  }
}
