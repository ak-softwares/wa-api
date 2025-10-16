import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      const response: ApiResponse = { success: false, message: "User not found" };
      return NextResponse.json(response, { status: 404 });
    }

    // Extract query params (?chatId=...&per_page=...&page=...)
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chatId");
    const per_page = Math.min(parseInt(searchParams.get("per_page") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Missing chatId" },
        { status: 400 }
      );
    }

    // Total messages for pagination
    const totalMessages = await Message.countDocuments({ userId: user._id, chatId });

    // Fetch paginated messages
    const messages = await Message.find({ userId: user._id, chatId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: "Messages fetched successfully",
      data: messages,
      pagination: {
        total: totalMessages,
        page,
        perPage: per_page,
        totalPages: Math.ceil(totalMessages / per_page),
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data ? JSON.stringify(error.response.data) : error.message
      }`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts)
      return NextResponse.json(
        { success: false, message: "No WA account found for this user" },
        { status: 404 }
      );

    const { phone_number_id, permanent_token } = user.waAccounts;
    if (!phone_number_id || !permanent_token)
      return NextResponse.json(
        { success: false, message: "User WA account not configured properly" },
        { status: 400 }
      );

    // Parse request body
    const { to, message } = await req.json();
    if (!to || !message)
      return NextResponse.json(
        { success: false, message: "Missing required fields: to, message" },
        { status: 400 }
      );

    // ✅ Find or create chat
    let chat = await Chat.findOne({
      userId: user._id,
      participants: {
        $elemMatch: { number: to } // looks inside the participants array
      },
      type: { $ne: "broadcast" } // NOT a broadcast chat
    });

    if (!chat) {
      // Try to link with contact (optional)
      chat = await Chat.create({
        userId: user._id,
        participants: [{ number: to }], // must be object, not string
        type: "single",
      });
    }

    const { newMessage, waMessageId } = await sendWhatsAppMessage({
      userId: user._id.toString(),
      chatId: chat._id,
      phone_number_id,
      permanent_token,
      to,
      message,
    });
   
    // ✅ Update chat
    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json(
      {
        success: true,
        message: waMessageId
          ? "Message sent successfully"
          : "Message failed to send",
        data: newMessage,
      },
      { status: waMessageId ? 200 : 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${
          error?.response?.data ? JSON.stringify(error.response.data) : error.message
        }`,
      },
      { status: 500 }
    );
  }
}
