import OpenAI from "openai";
import axios from "axios";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/messageStatus";
import { MessageType } from "@/types/messageType";
import { pusher } from "@/lib/pusher";

/**
 * Get AI reply from OpenAI for a specific chat
 */
export async function getAIReply(user: any, chat: any, phone_number_id: string) {
  if (!user.aiConfig?.isActive) return null;

  const aiPrompt = user.aiConfig.prompt || "You are a helpful AI assistant.";

  // Fetch last 20 user messages (exclude AI itself)
  const recentMessages = await Message.find({
    userId: user._id,
    chatId: chat._id,
    from: { $ne: phone_number_id },
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Convert messages to OpenAI format
  // Convert messages to OpenAI format
  const messageInput = recentMessages
    .map(msg => ({
      role: "user",
      content: [{ type: "input_text", text: msg.text || "" }] // content must be array
    }))
    .reverse();

  // System prompt as first input
  const input: any = [
    {
      role: "system",
      content: [{ type: "input_text", text: "You are a helpful assistant for aramarket.in." }]
    },
    ...messageInput
  ];

  
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const response = await openai.responses.create({
      model: "gpt-4o",
      instructions: aiPrompt,
      // input: 'you are a aramarket.in assistant.',
      input,
    });

    // response.output_text gives concatenated text output
    const reply = response.output_text;
    return reply || null;
  } catch (err) {
    console.error("AI reply error:", err);
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
