import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/Chat";
import { sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: NextRequest) {
  try {

    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token } = waAccount;

    // Parse request
    const { to, message } = await req.json();
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
      type: { $ne: "broadcast" },
    });

    if (!chat) {
      chat = await Chat.create({
        userId: user._id,
        waAccountId: waAccount._id,
        participants: [{ number: to }],
        type: "single",
      });
    }

    const { waMessageId, errorResponse: sendMsgError } = await sendWhatsAppMessage({
      userId: user._id.toString(),
      chatId: chat._id,
      phone_number_id,
      permanent_token,
      to,
      message,
    });
    if (sendMsgError) return sendMsgError;

    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json(
      {
        success: true,
        message: waMessageId
          ? "Message sent successfully"
          : "Failed to send",
        data: waMessageId,
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
