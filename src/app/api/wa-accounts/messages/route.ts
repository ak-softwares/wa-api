import { NextRequest, NextResponse } from "next/server";
import { MessageModel } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { MessagePayload } from "@/types/MessageType";
import { handleSendMessage } from "@/services/message/handleSendMessage";
import { MESSAGE_TAGS } from "@/utiles/enums/messageTags";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { checkMessageCreditsAvailability } from "@/services/wallet/checkMessageCreditsAvailability";
import { Types } from "mongoose";
import { ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";

// https://wa-api.me/api/wa-accounts/messages
export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page"));
    const perPageParam = Number(searchParams.get("per_page"));
    const page = Math.max(pageParam || 1, 1);
    const perPage  = Math.min(Math.max(perPageParam || ITEMS_PER_PAGE, 1), MAX_ITEMS_PER_PAGE);
    const skip = (page - 1) * perPage;
    const searchQuery = searchParams.get("q") || "";
    const chatId = searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "Missing chatId" },
        { status: 400 }
      );
    }

    const match = {
      userId: user._id,
      chatId: new Types.ObjectId(chatId),
      $or: [
        { isBroadcastMaster: { $exists: false } },
        { isBroadcastMaster: true },
      ],
    };

    const [result] = await MessageModel.aggregate([
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: perPage }],
        },
      },
    ]);

    const messages = result?.data || [];
    const totalMessages = result?.metadata?.[0]?.total || 0;

    const response: ApiResponse = {
      success: true,
      message: "Messages fetched successfully",
      data: messages,
      pagination: {
        total: totalMessages,
        page,
        perPage: perPage,
        totalPages: Math.ceil(totalMessages / perPage),
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
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Parse request body
    const messagePayload: MessagePayload = await req.json();

    const participantsLength = messagePayload.participants?.length || 0;
    if (participantsLength === 0) {
      const response: ApiResponse = { success: false, message: "Participants are required" };
      return NextResponse.json(response, { status: 400 });
    }

    // console.log("Building template payload:", JSON.stringify(messagePayload.template));
    const result = await handleSendMessage({
      messagePayload,
      userId: user._id,
      waAccount
    });

    // handle push notification if message send by ai
    if (result.message.tag === MESSAGE_TAGS.AI_AGENT ){
      await sendPusherNotification({
        userId: user._id.toString(),
        event: "new-message",
        chat: result.chat ?? undefined,
        message: result.message,
      });
    }
   
    const response: ApiResponse = {
      success: true,
      message: "Messages send successfully",
      data: result,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message || "Failed sending messages"
    };
    return NextResponse.json(response, { status: error.statusCode || 500 });
  }
}
