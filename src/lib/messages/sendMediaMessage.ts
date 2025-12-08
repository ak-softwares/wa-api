import axios from "axios";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { Chat, ChatParticipant } from "@/types/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { NextResponse } from "next/server";
import { IMessage } from "@/types/Message";
import { Types } from "mongoose";
import { Media, MediaType } from "@/utiles/enums/mediaTypes";

interface SendMediaOptions {
  userId: Types.ObjectId;
  chat: Chat;
  phone_number_id: string;
  permanent_token: string;
  participants: ChatParticipant[];
  media: Media;
  aiUsageId?: string;
  tag?: string;
}

/**
 * ✔ EXACT same architecture as sendTemplateMessage()
 * ✔ Works for single + broadcast
 * ✔ Handles all media types (image/video/audio/document/sticker)
 */
export async function sendMediaMessage({
  userId,
  chat,
  phone_number_id,
  permanent_token,
  participants,
  media,
  tag,
  aiUsageId,
}: SendMediaOptions) {
  const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;

  const headers = {
    Authorization: `Bearer ${permanent_token}`,
    "Content-Type": "application/json",
  };

  // ------------------------------------
  // Validate participants
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

  // ------------------------------------
  // LOOP (same as template logic)
  // ------------------------------------
  for (const participant of participants) {
    const to = participant?.number;
    if (!to) continue;

    // ------------------------------------
    // Build media payload
    // ------------------------------------
    const mediaObject: any = {};

    if (media.id) mediaObject.id = media.id;
    if (media.link) mediaObject.link = media.link;
    if (media.caption) mediaObject.caption = media.caption;

    const mediaType = media.mediaType?.toLowerCase();

    if (media.mediaType === MediaType.DOCUMENT && media.filename) {
      mediaObject.filename = media.filename;
    }

    const payload: any = {
      messaging_product: "whatsapp",
      to,
      type: mediaType,
      [mediaType!]: mediaObject,
    };

    let waMessageId: string | null = null;
    // console.log("payload:", JSON.stringify(payload, null, 2));
    try {
      const fbResponse = await axios.post(url, payload, { headers });

      waMessageId = fbResponse.data?.messages?.[0]?.id || null;

      // Only take 1st message ID for single chat return
      if (!firstWaMessageId) firstWaMessageId = waMessageId;
    } catch (err: any) {
      // ------------------------------------
      // EXACT required behavior (same as template):
      // If single chat → forward error
      // ------------------------------------
      if (participants.length === 1) {
        const response: ApiResponse = {
          success: false,
          message: err?.response?.data?.error?.message,
        };
        return {
          errorResponse: NextResponse.json(
            response,
            { status: err?.response?.status || 403 }
          ),
        };
      }

      // broadcast → allow fail but store failed status
      waMessageId = null;
    }

    // ------------------------------------
    // Store DB message
    // ------------------------------------
    dbMessages.push({
      userId,
      chatId: chat._id!,
      to,
      from: phone_number_id,
      waMessageId: waMessageId || undefined,
      status: waMessageId ? MessageStatus.Sent : MessageStatus.Failed,
      type: MessageType.MEDIA,
      media,
      tag,
      aiUsageId,
    });
  }

  // Insert all DB messages
  const newMessages = await Message.insertMany(dbMessages);

  return { newMessages, firstWaMessageId };
}
