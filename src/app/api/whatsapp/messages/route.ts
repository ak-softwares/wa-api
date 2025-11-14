import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { sendBroadcastMessage, sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { Message as IMessage } from "@/types/Message";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Extract query params (?chatId=...&per_page=...&page=...)
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const per_page = Math.min(parseInt(searchParams.get("per_page") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Missing chatId" },
        { status: 400 }
      );
    }

    // Total messages for pagination
    const totalMessages = await Message.countDocuments({ userId: user._id, chatId });

    // Fetch paginated messages
    const messages = await Message.find({ userId: user._id, chatId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: "Messages fetched successfully",
      data: messages,
      pagination: {
        total: totalMessages,
        page,
        perPage: per_page,
        totalPages: Math.ceil(totalMessages / per_page),
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data ? JSON.stringify(error.response.data) : error.message
      }`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token } = waAccount;

    // Parse request body
    const { chatId, message: inputMessage } = await req.json();
    if (!chatId || !inputMessage) {
      const response: ApiResponse = {
        success: false,
        message: "Missing required fields: chatId, message",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      const response: ApiResponse = {
        success: false,
        message: "Chat not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const participants = chat.participants || [];
    let sentMessage: IMessage | null = null;
    let success = false;

    // ✅ Handle different chat types
    if (chat.type === "broadcast") {
      const { newMessage } = await sendBroadcastMessage({
        userId: user._id,
        chatId: chat._id,
        phone_number_id,
        permanent_token,
        participants,
        message: inputMessage,
        tag: "broadcast",
      });
      sentMessage = newMessage;
      success = true;
    } else if (chat.type === "single") {
      const to = participants?.[0]?.number;
      const { newMessage, waMessageId, errorResponse: sendMsgError } = await sendWhatsAppMessage({
        userId: user._id.toString(),
        chatId: chat._id,
        phone_number_id,
        permanent_token,
        to,
        message: inputMessage,
      });
      if (sendMsgError) return sendMsgError; // 🚫 Handles all auth, DB, and token errors
      sentMessage = newMessage;
      success = !!waMessageId;
    }

    // ✅ Update chat with last message
    chat.lastMessage = sentMessage?.message;
    chat.lastMessageAt = new Date();
    await chat.save();

    const response: ApiResponse = {
      success,
      message: success
        ? "Message sent successfully"
        : "Message failed to send",
      data: sentMessage,
    };

    return NextResponse.json(response, {
      status: success ? 200 : 400,
    });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      }`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
