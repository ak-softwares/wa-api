import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { MessageModel } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { markChatClosed, markChatOpen } from "@/lib/activeChats";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: chatId } = await params;

    if (!chatId) {
      const response: ApiResponse = { success: false, message: "ChatId is required" };
      return NextResponse.json(response, { status: 400 });
    }

    // Find chat
    const chat = await ChatModel.findOne({ _id: chatId, userId: user._id });
    if (!chat) {
      const response: ApiResponse = { success: false, message: "Chat not found" };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete chat
    await ChatModel.deleteOne({ _id: chatId });

    // Delete all messages for this chat
    await MessageModel.deleteMany({ chatId: chatId });

    const response: ApiResponse = {
      success: true,
      message: "Chat and its messages deleted successfully",
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {

    const response: ApiResponse = { 
      success: false, 
      message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PATCH( req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, errorResponse } = await fetchAuthenticatedUser(req);
  if (errorResponse) return errorResponse;

  const { id: chatId } = await params;
  const userId = user?.id;

  if (!chatId) {
    const response: ApiResponse = {
      success: false,
      message: "ChatId is required",
    };
    return NextResponse.json(response, { status: 400 });
  }

  let body: { opened?: boolean };

  try {
    body = await req.json();
  } catch {
    const response: ApiResponse = {
      success: false,
      message: "Invalid JSON body",
    };
    return NextResponse.json(response, { status: 400 });
  }

  const { opened } = body;

  if (typeof opened !== "boolean") {
    const response: ApiResponse = {
      success: false,
      message: "`opened` (boolean) is required",
    };
    return NextResponse.json(response, { status: 400 });
  }

  // ✅ OPEN CHAT
  if (opened) {
    await ChatModel.updateOne(
      {
        _id: chatId,
        userId: user._id,
        unreadCount: { $gt: 0 },
      },
      {
        $set: { unreadCount: 0 },
      }
    );

    markChatOpen(userId, chatId);

    const response: ApiResponse = {
      success: true,
      message: "Chat opened and unread count is 0 successfully",
    };
    return NextResponse.json(response, { status: 200 });
  }

  // ✅ CLOSE CHAT
  markChatClosed(userId, chatId);

  const response: ApiResponse = {
    success: true,
    message: "Chat closed successfully",
  };
  return NextResponse.json(response, { status: 200 });
}