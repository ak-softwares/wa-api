import { ApiTokenModel } from "@/models/ApiToken";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id: tokenId } = await params;

    if (!tokenId) {
      const response: ApiResponse = {
        success: false,
        message: "tokenId is required",
      };
  
      return NextResponse.json(response, { status: 400 });
    }
    
    const token = await ApiTokenModel.findOneAndDelete({ _id: tokenId });

    if (!token) {
      return NextResponse.json({ success: false, message: "Token not found or unauthorized" }, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "API token revoked successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to revoke token",
    };
    return NextResponse.json(response, { status: 500 });
  }
} 