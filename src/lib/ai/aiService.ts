import OpenAI from "openai";
import { Message } from "@/models/Message";
import { connectDB } from "../mongoose";
import { Chat } from "@/types/Chat";

/**
 * Get AI reply from OpenAI for a specific chat
 */
interface GetAIReplyParams {
  prompt: string;
  phone_number_id: string;
  chat: Chat;
  user_name: string;
}

export async function getAIReply({prompt, chat, phone_number_id, user_name}: GetAIReplyParams) {

  const aiPrompt = prompt || "You are a helpful AI assistant.";
  const finalSystemPrompt = `
${aiPrompt}

The user's name is: ${user_name}.
Use the user's name naturally in your responses when appropriate.
Do NOT overuse the name.
`;
  await connectDB();
  // Fetch last 20 user messages (exclude AI itself)
  const recentMessages = await Message.find({
    chatId: chat._id,
  })
    .sort({ createdAt: -1 })
    .limit(6)
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
      content: finalSystemPrompt,
    },
    ...historyMessages,
  ];
  // console.log("Messages:", JSON.stringify(messages, null, 2));

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // gpt-4o for better result
      messages,
      temperature: 0.4, // 0.7 for more creative
      max_tokens: 200, // 500 for bigger reply
      top_p: 1, // choice freedom 1
      presence_penalty: 0, // avoid repeating topics
      frequency_penalty: 0, // avoid repeating words
    });

    // response.output_text gives concatenated text output
    const reply = response.choices[0]?.message?.content || null;
    return reply || null;
  } catch (err) {
    return null;
  }
}
