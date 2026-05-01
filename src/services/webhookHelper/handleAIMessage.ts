import { IChat } from "@/models/Chat";
import { IWaAccount } from "@/models/WaAccount";
import { webhookHandler } from "@/services/ai/webhookTool/webhookService";
import { handleSendMessage } from "../message/handleSendMessage";
import { MessageType } from "@/types/MessageType";
import { ToolModel } from "@/models/Tool";
import { getReplyFromChatAgent } from "../ai/aiSDK/agents/chatAgent";
import { messageHistory } from "../message/messageHistory";
import { IMessage } from "@/models/Message";
import { checkMessageCreditsAvailability } from "../wallet/checkMessageCreditsAvailability";
import { IUser } from "@/models/User";
import { AIAssistantModel, IAIAssistant } from "@/models/AIAssistant";
import { MessageModel } from "@/models/Message";

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

  const aiAssistant = await AIAssistantModel.findOne({ userId: user._id }).lean<IAIAssistant | null>();

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
      prompt: aiAssistant?.prompt,
      user_name: sender_name,
      user_phone: from,
    });
  }

  // AI assistant directly
  if (aiAssistant?.isActive) {
    const messageLimit = Math.max(1, aiAssistant.messageLimit ?? 20);
    const limitWindowInHours = Math.max(1, aiAssistant.limitWindowInHours ?? 1);
    const windowStart = new Date(Date.now() - limitWindowInHours * 60 * 60 * 1000);

    const usedRepliesInWindow = await MessageModel.countDocuments({
      userId: user._id,
      chatId: chat._id,
      tag: "aiAssistant",
      createdAt: { $gte: windowStart },
    });
    if (usedRepliesInWindow >= messageLimit) return;
    
    // ✅ only check (no debit here)
    const creditCheck = await checkMessageCreditsAvailability({ userId: user._id, credits: 1 });
    if (!creditCheck.allowed) return;

    const messages: IMessage[] = await messageHistory({ chatId: chat._id!, length: 20 });
    const systemPrompt = aiAssistant?.prompt ?? "";

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
      await handleSendMessage({
        messagePayload,
        userId: user._id,
        waAccount,
        isCreditAlreadyCheck: true,
      });
    }
  }
}
