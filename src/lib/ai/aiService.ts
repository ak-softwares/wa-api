import OpenAI from "openai";
import axios from "axios";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/messageStatus";
import { MessageType } from "@/types/messageType";
import { pusher } from "@/lib/pusher";
import { connectDB } from "../mongoose";

/**
 * Get AI reply from OpenAI for a specific chat
 */
export async function getAIReply(prompt: string, chat: any, phone_number_id: string) {

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


/**
 * Send WhatsApp message via Cloud API and save to DB
 */
export async function sendMessage(user: any, chat: any, to: string, message: string) {
  try {
    const phone_number_id = user.waAccounts.phone_number_id;
    const permanent_token = user.waAccounts.permanent_token;

    if (!phone_number_id || !permanent_token) return null;

    const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };

    const fbResponse = await axios.post(url, payload, { headers });

    // Save to DB
    const savedMsg = await Message.create({
      userId: user._id,
      chatId: chat._id,
      to,
      from: phone_number_id,
      message,
      waMessageId: fbResponse.data?.messages?.[0]?.id,
      status: fbResponse.data?.messages?.[0]?.id ? MessageStatus.Sent : MessageStatus.Failed,
      type: MessageType.Text,
    });

    // Update chat last message
    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Push to frontend
    await pusher.trigger(`chat-${chat._id}`, "new-message", { message: savedMsg });

    return savedMsg;
  } catch (err) {
    return null;
  }
}
