import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST() {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Update user's API token at root level (since your User model has apiToken field)
    const newToken = waAccount.generateApiToken();
    await waAccount.save();

    const response: ApiResponse = {
      success: true,
      message: "New API token generated successfully",
      data: {
        token: newToken,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to generate token",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// GET - Retrieve current API token
export async function GET() {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
        
    const response: ApiResponse = {
      success: true,
      message: "API token retrieved successfully",
      data: {
        token: waAccount.apiToken || null,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to retrieve token",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - Revoke API token
export async function DELETE() {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Revoke the token by setting it to null
    waAccount.apiToken = null;
    waAccount.apiTokenHashed = null;
    waAccount.apiTokenUpdatedAt = new Date();

    await waAccount.save();

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