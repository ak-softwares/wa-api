import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: chatId } = await params;
    if (!chatId) {
      const response: ApiResponse = { success: false, message: "ChatId is required" };
      return NextResponse.json(response, { status: 400 });
    }
    const chat = await ChatModel.findOne({ _id: chatId, userId: user._id });
    if (!chat) {
      const response: ApiResponse = { success: false, message: "Chat not found" };
      return NextResponse.json(response, { status: 404 });
    }

    // Toggle the favourite value
    chat.isFavourite = !chat.isFavourite;
    await chat.save();

    const response: ApiResponse = {
      success: true,
      message: chat.isFavourite
        ? "Added to favourites"
        : "Removed from favourites",
      data: { isFavourite: chat.isFavourite },
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
