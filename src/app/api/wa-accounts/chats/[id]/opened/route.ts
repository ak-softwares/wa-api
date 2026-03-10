import { markChatOpen } from "@/lib/activeChats";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  
  const { user, errorResponse } = await fetchAuthenticatedUser(req);
  if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
  
  const { id: chatId } = await params;
  const userId = user?.id;
  if (!chatId) {
    const response: ApiResponse = { success: false, message: "ChatId is required" };
    return NextResponse.json(response, { status: 400 });
  }

  markChatOpen(userId, chatId);

  const response: ApiResponse = {
    success: true,
    message: "Chat opened successfully",
  };
  return NextResponse.json(response, { status: 200 });
}
