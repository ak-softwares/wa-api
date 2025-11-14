import OpenAI from "openai";
import { Message } from "@/models/Message";
import { pusher } from "@/lib/pusher";
import { connectDB } from "../mongoose";
import { IChat } from "@/types/Chat";
import { Chat } from "@/models/Chat";
import { User } from "@/types/User";
import { sendWhatsAppMessage } from "../messages/sendWhatsAppMessage";

/**
 * Get AI reply from OpenAI for a specific chat
 */
export async function getAIReply(prompt: string, chat: IChat, phone_number_id: string) {

  const aiPrompt = prompt || "You are a helpful AI assistant.";

  await connectDB();
  // Fetch last 20 user messages (exclude AI itself)
  const recentMessages = await Message.find({
    chatId: chat._id,
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Convert messages into proper chat format
  const historyMessages = recentMessages
    .map((msg) => ({
      role: msg.from === phone_number_id ? "assistant" : "user",
      content: msg.message || "",
    }))
    .reverse(); // oldest → newest

  // Final messages array
  const messages: any[] = [
    {
      role: "system",
      content: aiPrompt,
    },
    ...historyMessages,
  ];

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // response.output_text gives concatenated text output
    const reply = response.choices[0]?.message?.content || null;
    return reply || null;
  } catch (err) {
    return null;
  }
}
