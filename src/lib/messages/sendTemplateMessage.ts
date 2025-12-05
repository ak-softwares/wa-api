import axios from "axios";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { Chat, ChatParticipant } from "@/types/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { NextResponse } from "next/server";
import { ITemplate, Template } from "@/types/Template";
import { IMessage } from "@/types/Message";
import { Types } from "mongoose";
import { convertTemplateToMetaForSend } from "../mapping/convertTemplateToMeta";

interface SendTemplateOptions {
  userId: Types.ObjectId;
  chat: Chat;
  phone_number_id: string;
  permanent_token: string;
  participants: ChatParticipant[];
  template: ITemplate;
  tag?: string;
  aiUsageId?: string;
}

/**
 * Unified sender for BOTH:
 * - single chat
 * - broadcast chat
 */
export async function sendTemplateMessage({
  userId,
  chat,
  phone_number_id,
  permanent_token,
  participants,
  template,
  tag,
  aiUsageId,
}: SendTemplateOptions) {
  const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;

  const headers = {
    Authorization: `Bearer ${permanent_token}`,
    "Content-Type": "application/json",
  };

  // ------------------------------------
  // Determine participant list
  // ------------------------------------

  if (!participants || participants.length === 0) {
    return {
      errorResponse: NextResponse.json(
        { success: false, message: "No participants found" },
        { status: 400 }
      ),
    };
  }

  const dbMessages: IMessage[] = [];
  let firstWaMessageId: string | null = null;
  const metaTemplate = convertTemplateToMetaForSend(template);

  // ------------------------------------
  // LOOP (works for single + broadcast)
  // ------------------------------------
  for (const participant of participants) {
    const to = participant?.number;
    if (!to) continue;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: metaTemplate.template,
    };
    let waMessageId: string | null = null;
    // console.log("Payload:", JSON.stringify(payload, null, 2));
    
    try {
      const fbResponse = await axios.post(url, payload, { headers });
      waMessageId = fbResponse.data?.messages?.[0]?.id || null;

      // store first id for single chat return
      if (!firstWaMessageId) firstWaMessageId = waMessageId;
    } catch (err: any) {
        // ----------------------------
        // 👇 NEW REQUIRED BEHAVIOR
        // If single participant => return error
        // ----------------------------
        if (participants.length === 1) {
          const response: ApiResponse = { success: false, message: err?.response?.data?.error?.message };
          return { errorResponse: NextResponse.json(response, { status: err?.response?.status || 403 }) };
        }
      waMessageId = null;
    }

    // Save message to DB
    dbMessages.push({
      userId,
      chatId: chat._id!,
      to,
      from: phone_number_id,
      template: template,
      waMessageId: waMessageId ? waMessageId : undefined,
      status: waMessageId ? MessageStatus.Sent : MessageStatus.Failed,
      type: MessageType.Template,
      tag,
      aiUsageId,
    });
  }

  // Insert all created messages
  const newMessages = await Message.insertMany(dbMessages);

  return { newMessages };
}
