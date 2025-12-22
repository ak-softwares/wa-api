import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/Chat";
import { sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { Context } from "@/types/Message";
import { ChatType } from "@/types/Chat";

interface SendMessageRequest {
  to: string;
  message: string;
  tag: string;
  context?: Context;
}

export async function POST(req: NextRequest) {
  try {

    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token } = waAccount;

    // Parse request
    const { to, message, tag, context }: SendMessageRequest = await req.json();
    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: "Missing number or message" },
        { status: 400 }
      );
    }

    // Find or create chat
    let chat = await Chat.findOne({
      userId: user._id,
      waAccountId: waAccount._id,
      participants: { $elemMatch: { number: to } },
      type: { $ne: ChatType.BROADCAST },
    });

    if (!chat) {
      chat = await Chat.create({
        userId: user._id,
        waAccountId: waAccount._id,
        participants: [{ number: to }],
        type: ChatType.CHAT,
      });
    }

    const { newMessage, waMessageId, errorResponse: sendMsgError } = await sendWhatsAppMessage({
      userId: user._id.toString(),
      chatId: chat._id,
      phone_number_id,
      permanent_token,
      to,
      message,
      tag,
      context,
    });
    if (sendMsgError) return sendMsgError;

    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    await chat.save();

    await sendPusherNotification({
      userId: user._id.toString(),
      event: "new-message",
      chat,
      message: newMessage,
    });

    return NextResponse.json(
      {
        success: !!waMessageId,
        message: waMessageId
          ? "Message sent successfully"
          : "Failed to send message",
        data: {
          waMessageId: waMessageId || undefined,
          // chat,
        },
      },
      { status: waMessageId ? 200 : 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal error",
      },
      { status: 500 }
    );
  }
}
