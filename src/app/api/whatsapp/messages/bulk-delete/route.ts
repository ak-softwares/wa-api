// ✅ POST /api/whatsapp/messages/bulk-delete
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";
import { Message } from "@/models/Message";

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
        message: "No message IDs provided",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Delete messages belonging to authenticated user
    const messageDeleteResult = await Message.deleteMany({
      _id: { $in: ids },
      userId: user._id,
    });

    if (messageDeleteResult.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No messages found or unauthorized",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: `${messageDeleteResult.deletedCount} message(s) deleted successfully`,
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
