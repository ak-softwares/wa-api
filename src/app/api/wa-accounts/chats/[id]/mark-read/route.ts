import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: chatId } = await params;
    if (!chatId) {
      const response: ApiResponse = { success: false, message: "ChatId is required" };
      return NextResponse.json(response, { status: 400 });
    }

    const chat = await ChatModel.findOneAndUpdate(
      {
        _id: chatId,
        userId: user._id,
        unreadCount: { $gt: 0 }, // only update if needed
      },
      {
        $set: { unreadCount: 0 },
      },
      {
        new: true,
      }
    );

    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found or already read" },
        { status: 404 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: "Chat marked as read successfully",
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
