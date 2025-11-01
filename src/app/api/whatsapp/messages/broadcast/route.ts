import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { sendBroadcastMessage } from "@/lib/messages/sendWhatsAppMessage";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token } = waAccount;

    const { chatId, participants, message } = await req.json();
    if (!participants || !Array.isArray(participants) || participants.length === 0 || !message || !chatId) {
      const response: ApiResponse = { success: false, message: "Missing required fields: recipients (array), message" };
      return NextResponse.json(response, { status: 400 });
    }

    // Optional: find a broadcast chat for this user
    let broadcastChat = await Chat.findOne({ _id: chatId});

    const { results } = await sendBroadcastMessage({
        userId: user._id,
        chatId: broadcastChat._id,
        phone_number_id,
        permanent_token,
        participants,
        message,
        tag: "broadcast"
    });
      
    // ✅ Update broadcast chat if exists
    if (broadcastChat) {
      broadcastChat.lastMessage = message;
      broadcastChat.lastMessageAt = new Date();
      await broadcastChat.save();
    }

    const response: ApiResponse = {
      success: true,
      message: "Broadcast completed",
      data: results,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
