import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { sendBroadcastMessage, sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { Context, Message as IMessage } from "@/types/Message";
import { ChatType } from "@/types/Chat";
import { MessagePaylaod } from "@/types/MessagePayload";
import { handleSendMessage } from "@/lib/messages/handleSendMessage";

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
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Parse request body
    const messagePayload: MessagePaylaod = await req.json();
    const result = await handleSendMessage({
      messagePayload,
      userId: user._id,
      waAccount
    });

    const response: ApiResponse = {
      success: true,
      message: "Messages send successfully",
      data: result,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message || "Failed sending messages"
    };
    return NextResponse.json(response, { status: error.statusCode || 500 });
  }
}
