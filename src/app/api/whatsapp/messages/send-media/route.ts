import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/Chat";
import { sendMediaMessage } from "@/lib/messages/sendMediaMessage";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { Context, IMessage } from "@/types/Message";
import { Media } from "@/utiles/enums/mediaTypes";

interface SendMediaRequest {
  chatId: string;
  media: Media;
  context?: Context;
}

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { phone_number_id, permanent_token } = waAccount;

    const { chatId, media, context }: SendMediaRequest = await req.json();
    if (!chatId || !media) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: chatId, media" },
        { status: 400 }
      );
    }

    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    // Call your unified sender
    const { newMessages, errorResponse: mediaError } = await sendMediaMessage({
        userId: user._id,
        chat: chat,
        phone_number_id,
        permanent_token,
        participants: chat.participants || [],
        media,
    });

    if (mediaError) return mediaError;

    const messages = newMessages as IMessage[];
    const success = Array.isArray(messages) && messages.length > 0;

    // ✅ Update chat metadata
    chat.lastMessage = media.caption || `${media?.mediaType?.toUpperCase()} file`;
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json({ success, message: success ? "Media sent successfully" : "Failed to send media", data: messages }, { status: success ? 200 : 400 });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}` }, { status: 500 });
  }
}
