import { markChatOpen } from "@/lib/activeChats";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  
  const { user, errorResponse } = await fetchAuthenticatedUser();
  if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
  
  const { id: chatId } = await params;
  const userId = user?.id;
  if (!chatId) {
    return NextResponse.json({ success: false, message: "chatId is required" }, { status: 400 });
  }

  markChatOpen(userId, chatId);

  return Response.json({ success: true });
}
