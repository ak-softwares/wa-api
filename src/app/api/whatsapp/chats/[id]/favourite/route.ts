import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";

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

    // Toggle the favourite value
    chat.isFavourite = !chat.isFavourite;
    await chat.save();

    return NextResponse.json({
      success: true,
      message: chat.isFavourite
        ? "Added to favourites"
        : "Removed from favourites",
      data: { isFavourite: chat.isFavourite },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to toggle favourite" },
      { status: 500 }
    );
  }
}
