import axios from "axios";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { ChatParticipant } from "@/types/Chat";

interface SendMessageOptions {
  userId: string;
  chatId: string; // optional, if you want to link message to a chat
  phone_number_id: string;
  permanent_token: string;
  to: string;
  message: string;
  tag?: string;
}

/**
 * Send a WhatsApp message via Cloud API and save in DB
 */
export async function sendWhatsAppMessage({
  userId,
  chatId,
  phone_number_id,
  permanent_token,
  to,
  message,
  tag,
}: SendMessageOptions) {
  const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;
  const headers = {
    Authorization: `Bearer ${permanent_token}`,
    "Content-Type": "application/json",
  };

  let waMessageId: string | undefined;
  let status: MessageStatus = MessageStatus.Failed;

  try {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };

    const fbResponse = await axios.post(url, payload, { headers });
    waMessageId = fbResponse.data?.messages?.[0]?.id;
    status = waMessageId ? MessageStatus.Sent : MessageStatus.Failed;
  } catch (err: any) {
    // Fail silently, status = Failed
    // console.error("Send WA message error:", err?.response?.data || err.message);
  }

  // Save message in DB
  const newMessage = await Message.create({
      userId,
      chatId: chatId,
      to,
      from: phone_number_id,
      message,
      waMessageId,
      status,
      type: MessageType.Text,
      tag,
  });

  return { newMessage, waMessageId, status };
}

interface SendBroadcastOptions {
  userId: string;
  chatId: string;
  phone_number_id: string;
  permanent_token: string;
  participants: ChatParticipant[];
  message: string;
  tag?: string;
}

/**
 * Send a broadcast message to multiple WhatsApp recipients via Cloud API
 * and save a record in DB.
 */
export async function sendBroadcastMessage({
  userId,
  chatId,
  phone_number_id,
  permanent_token,
  participants,
  message,
  tag = "broadcast",
}: SendBroadcastOptions) {
  const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;
  const headers = {
    Authorization: `Bearer ${permanent_token}`,
    "Content-Type": "application/json",
  };

  const recipients = participants.map((p) => p.number);
  const results: { to: string; success: boolean; waMessageId?: string; error?: string }[] = [];

  for (const to of recipients) {
    let waMessageId: string | undefined;
    let status: MessageStatus = MessageStatus.Failed;

    try {
      const payload = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      };

      const fbResponse = await axios.post(url, payload, { headers });
      waMessageId = fbResponse.data?.messages?.[0]?.id;
      status = waMessageId ? MessageStatus.Sent : MessageStatus.Failed;

      results.push({ to, success: true, waMessageId });
    } catch (err: any) {
      results.push({
        to,
        success: false,
        error: err?.response?.data ? JSON.stringify(err.response.data) : err.message,
      });
    }

    // Save each message in DB
    // await Message.create({
    //   userId,
    //   chatId,
    //   to,
    //   from: phone_number_id,
    //   message,
    //   waMessageId,
    //   status,
    //   type: MessageType.Text,
    //   tag,
    // });
  }

  // ✅ Save a single broadcast record (optional summary message)
  const newMessage = await Message.create({
    userId,
    chatId,
    to: "broadcast",
    from: phone_number_id,
    message,
    waMessageId: "",
    status: MessageStatus.Sent,
    type: MessageType.Text,
    tag,
    participants,
  });

  return { newMessage, results };
}
