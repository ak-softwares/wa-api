import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";
import { WaAccount } from "@/types/WaAccount";
import { ApiResponse } from "@/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing Bearer token" },
        { status: 401 }
      );
    }

    await connectDB();

    // find user by API token
    const user = await User.findOne({ apiToken: token });
    if (!user || !user.waAccounts || user.waAccounts.length === 0) {
      const response: ApiResponse = { success: false, message: "No WA account found", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);

    if (!wa) {
      const response: ApiResponse = { success: false, message: "No default WA account", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    if (!wa.phone_number_id || !wa.permanent_token) {
      return NextResponse.json(
        { success: false, message: "WA account not configured for this user" },
        { status: 400 }
      );
    }

    const { phone_number_id, permanent_token } = wa;

    // Parse request
    const { to, message } = await req.json();
    if (!to || !message) {
      return NextResponse.json(
        { success: false, message: "Missing number or message" },
        { status: 400 }
      );
    }

    // Find or create chat
    let chat = await Chat.findOne({
      userId: user._id,
      waAccountId: wa._id,
      participants: { $elemMatch: { number: to } },
      type: { $ne: "broadcast" },
    });

    if (!chat) {
      chat = await Chat.create({
        userId: user._id,
        waAccountId: wa._id,
        participants: [{ number: to }],
        type: "single",
      });
    }

    const { waMessageId } = await sendWhatsAppMessage({
      userId: user._id.toString(),
      chatId: chat._id,
      phone_number_id,
      permanent_token,
      to,
      message,
    });

    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json(
      {
        success: true,
        message: waMessageId
          ? "Message sent successfully"
          : "Failed to send",
        data: waMessageId,
      },
      { status: waMessageId ? 200 : 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal error",
      },
      { status: 500 }
    );
  }
}
