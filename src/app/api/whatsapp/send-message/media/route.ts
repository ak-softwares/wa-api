import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/Chat";
import { sendMediaMessage } from "@/lib/messages/sendMediaMessage";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { Context, IMessage } from "@/types/Message";
import { Media } from "@/utiles/enums/mediaTypes";
import { IChat } from "@/types/Chat";
import { getOrCreateChat } from "@/lib/webhook-helper/getOrCreateChat";

interface SendMediaRequest {
  to: string;
  media: Media;
  tag: string;
  context?: Context;
}

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse;

    const { phone_number_id, permanent_token } = waAccount;

    const { to, media, tag, context }: SendMediaRequest = await req.json();
    if (!to || !media) {
      return NextResponse.json(
        { success: false, message: "Missing number or media" },
        { status: 400 }
      );
    }

    // Local cache for chats to reduce DB calls
    const chatCache = new Map<string, IChat>();

    // Get or create chat using cache
    const chat: IChat | null = await getOrCreateChat({
      userId: user._id,
      waAccountId: waAccount._id!,
      phone: to,
      chatCache,
    });
    
    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Failed to get or create chat" },
        { status: 400 }
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
        tag,
    });

    if (mediaError) return mediaError;

    const messages = newMessages as IMessage[];
    const success = Array.isArray(messages) && messages.length > 0;

    // ✅ Update chat metadata
    const updateFields: Partial<IChat> = {
      lastMessage: media.caption || `${media?.mediaType?.toUpperCase()} file`,
      lastMessageAt: new Date(),
    };
    await Chat.updateOne({ _id: chat._id }, { $set: updateFields });

    return NextResponse.json(
      {
        success: success,
        message: success
          ? "Media sent successfully"
          : "Failed to send media",
        // data: {
        //   chat,
        // },
      },
      { status: success ? 200 : 400 }
    );
    
  } catch (error: any) {
    return NextResponse.json({ success: false, message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}` }, { status: 500 });
  }
}
