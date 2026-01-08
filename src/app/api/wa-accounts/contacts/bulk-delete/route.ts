import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ContactModel } from "@/models/Contact";

export async function POST(req: NextRequest) {
  try {
    // ✅ Authenticated user
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse;

    // ✅ Parse body
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No contact IDs provided",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Delete all matching contacts belonging to the same user
    const result = await ContactModel.deleteMany({
      _id: { $in: ids },
      userId: user._id,
    });

    if (result.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No contacts found or unauthorized",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: `${result.deletedCount} contact(s) deleted successfully`,
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
