import OpenAI from "openai";
import { MessageModel } from "@/models/Message";
import { connectDB } from "../../../lib/mongoose";
import { IChat } from "@/models/Chat";
import { AiUsageModel } from "@/models/AiUsage";
import { Types } from "mongoose";
import { AI_PROVIDERS } from "../ai/providers/providers";

// Get AI reply from OpenAI for a specific chat

interface GetAIReplyParams {
  userId: Types.ObjectId;
  prompt: string;
  phone_number_id: string;
  chat: IChat;
  user_name?: string;
  user_phone?: string;
}
export async function getAIReply({
  userId,
  prompt,
  chat,
  phone_number_id,
  user_name,
  user_phone,
}: GetAIReplyParams) {

  const aiPrompt = prompt || "You are a helpful AI assistant.";
  const finalSystemPrompt = `
${aiPrompt}

The user's name is: ${user_name}. The user's phone number is: ${user_phone}
Use the user's name naturally in your responses when appropriate.
Do NOT overuse the name.
`;

  await connectDB();

  const recentMessages = await MessageModel.find({
    chatId: chat._id,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const historyMessages = recentMessages
    .map((msg) => ({
      role: msg.from === phone_number_id ? "assistant" : "user",
      content: msg.message || "",
    }))
    .reverse();

  const messages: any[] = [
    {
      role: "system",
      content: finalSystemPrompt,
    },
    ...historyMessages,
  ];

  try {
    const aiProvider = AI_PROVIDERS.GPT_4O_MINI.id;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: aiProvider,
      messages,
      temperature: 0.4,
      max_tokens: 200,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      user: userId.toString(),
    });

    // Extract AI reply
    const aiGeneratedReply = response.choices[0]?.message?.content;

    if (!aiGeneratedReply) {
      throw new Error("AI did not return any reply.");
    }

    // Save usage
    const usage = response.usage;
    if (!usage) {
      throw new Error("OpenAI did not return usage info.");
    }

    const inputPrice = 0.150;
    const outputPrice = 0.600;

    const promptCost = (usage.prompt_tokens / 1_000_000) * inputPrice;
    const completionCost = (usage.completion_tokens / 1_000_000) * outputPrice;
    const totalCost = promptCost + completionCost;

    const created = await AiUsageModel.create({
      userId,
      chatId: chat._id,
      model: aiProvider,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      promptCost,
      completionCost,
      totalCost,
    });

    // Return both values
    return {
      aiGeneratedReply,
      aiUsageId: created._id.toString(),
    };
  } catch (err: any) {
    // Throw a clean error message
    throw new Error(err?.message || "Failed to get AI reply.");
  }
}

