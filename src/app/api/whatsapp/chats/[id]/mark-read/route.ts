import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";

// PATCH /api/whatsapp/chats/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: chatId } = await params;
    if (!chatId) {
      return NextResponse.json({ success: false, message: "chatId is required" }, { status: 400 });
    }

    const chat = await ChatModel.findOne({ _id: chatId, userId: user._id });
    if (!chat) {
      return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
    }

    // Only update if unreadCount > 0
    if ((chat.unreadCount ?? 0) > 0) {
      chat.unreadCount = 0;
      await chat.save();
    }

    const response: ApiResponse = {
      success: true,
      message: "Chat marked as read successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
      },
      { status: 500 }
    );
  }
}
