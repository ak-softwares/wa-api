import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// PATCH /api/whatsapp/chats/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { id: chatId } = await params;
    if (!chatId) {
      return NextResponse.json({ success: false, message: "chatId is required" }, { status: 400 });
    }

    const chat = await Chat.findOne({ _id: chatId, userId: user._id });
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
