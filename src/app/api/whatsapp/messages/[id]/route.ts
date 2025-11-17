import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";

// DELETE /api/whatsapp/messages/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: messageId } = await params;

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: "messageId is required" },
        { status: 400 }
      );
    }

    // 🔍 Find message and ensure it belongs to the user's chat
    const message = await Message.findOne({ _id: messageId });
    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }
    
    // 🗑️ Delete message
    await Message.deleteOne({ _id: messageId });

    const response: ApiResponse = {
      success: true,
      message: "Message deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`,
      },
      { status: 500 }
    );
  }
}
