import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { sendBroadcastMessage } from "@/lib/messages/sendWhatsAppMessage";
import { WaAccount } from "@/types/WaAccount";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts || user.waAccounts.length === 0) {
      const response: ApiResponse = { success: false, message: "No WA account found", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);

    if (!wa) {
      const response: ApiResponse = { success: false, message: "No default WA account", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const { phone_number_id, permanent_token } = wa;
    if (!phone_number_id || !permanent_token) {
      const response: ApiResponse = { success: false, message: "User WA account not configured properly" };
      return NextResponse.json(response, { status: 400 });
    }

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
