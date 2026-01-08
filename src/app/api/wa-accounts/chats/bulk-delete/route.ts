// ✅ POST /api/wa-accounts/chats/bulk-delete
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ChatModel } from "@/models/Chat";
import { MessageModel } from "@/models/Message";

export async function POST(req: NextRequest) {
  try {
    // ✅ Authenticate user
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse;

    // ✅ Parse request body
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No chat IDs provided",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Delete chats belonging to the authenticated user
    const chatDeleteResult = await ChatModel.deleteMany({
      _id: { $in: ids },
      userId: user._id,
    });

    if (chatDeleteResult.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No chats found or unauthorized",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ✅ Delete all related messages for these chats
    await MessageModel.deleteMany({ chatId: { $in: ids } });

    const response: ApiResponse = {
      success: true,
      message: `${chatDeleteResult.deletedCount} chat(s) and their messages deleted successfully`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err?.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
