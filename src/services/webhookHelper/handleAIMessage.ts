import { IChat } from "@/models/Chat";
import { IWaAccount } from "@/models/WaAccount";
import { webhookHandler } from "@/services/ai/webhookTool/webhookService";
import { getAIReply } from "@/services/ai/aiChat/aiChat";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { handleSendMessage } from "../message/handleSendMessage";
import { MessageType } from "@/types/MessageType";
import { Types } from "mongoose";
import { ToolModel } from "@/models/Tool";
import { getReplyFromChatAgent } from "../ai/aiSDK/agents/chatAgent";
import { messageHistory } from "../message/messageHistory";
import { IMessage } from "@/models/Message";

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

  // ✅ 2) Check webhook tool
  const webhookTool = await ToolModel.findOne({
    userId,
    waAccountId: waAccount._id,
    id: "webhook",
    active: true,
  });

  // AI agent via webhook
  if (webhookTool?.credentials?.webhookUrl) {
    await webhookHandler({
      webhookUrl: webhookTool.credentials.webhookUrl,
      payload: change, // single message payload
      prompt: waAccount.aiChat?.prompt,
      user_name: sender_name,
      user_phone: from,
    });
  }

  // AI chat-agent directly
  if (waAccount.aiChat?.isActive) {
    const messages: IMessage[] = await messageHistory({ chatId: chat._id!, length: 20 });
    const systemPrompt = waAccount.aiChat?.prompt ?? "";

    const { aiGeneratedReply } = await getReplyFromChatAgent({
      userId: userId,
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

  // AI chat directly
  // if (waAccount.aiChat?.isActive) {
  //   const { aiGeneratedReply, aiUsageId } = await getAIReply({
  //     userId: userId,
  //     prompt: waAccount.aiChat?.prompt ?? "",
  //     chat,
  //     phone_number_id,
  //     user_name: sender_name,
  //     user_phone: from,
  //   });

  //   if (aiGeneratedReply) {
  //     const messagePayload = {
  //       participants: [{ number: from }],
  //       messageType: MessageType.TEXT,
  //       message: aiGeneratedReply,
  //       tag: "aichat",
  //     };
  //     const result = await handleSendMessage({
  //       messagePayload,
  //       userId: userId,
  //       waAccount
  //     });

  //     if (result.sent > 0 && result.message) {
  //       // Trigger message for specific user (listener)
  //       await sendPusherNotification({
  //         userId: userId.toString(),
  //         event: "new-message",
  //         chat,
  //         message: result.message,
  //       });
  //     }
  //   }
  // }
}
