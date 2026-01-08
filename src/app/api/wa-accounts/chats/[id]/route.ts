import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { MessageModel } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";

// DELETE /api/wa-accounts/chats/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: chatId } = await params;

    if (!chatId) {
      return NextResponse.json({ success: false, message: "chatId is required" }, { status: 400 });
    }

    // Find chat
    const chat = await ChatModel.findOne({ _id: chatId, userId: user._id });
    if (!chat) {
      return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
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
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
      },
      { status: 500 }
    );
  }
}
