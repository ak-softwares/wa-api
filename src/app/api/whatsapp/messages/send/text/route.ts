import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { MessagePaylaod } from "@/types/MessagePayload";
import { handleSendMessage } from "@/lib/messages/handleSendMessage";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Parse request body
    const sendMessage: MessagePaylaod = await req.json();
    if (!sendMessage.participants || sendMessage.participants.length === 0 || !sendMessage.messageType) {
      const response: ApiResponse = {
        success: false,
        message: "Missing required fields: participants, type",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const result = await handleSendMessage({
      messagePayload: sendMessage,
      userId: user._id,
      waAccount
    });

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
