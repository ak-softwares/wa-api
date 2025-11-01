import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST() {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Generate new API token
    const newToken = generateApiToken();
    
    // Update user's API token at root level (since your User model has apiToken field)
    user.apiToken = newToken;
    user.updatedAt = new Date();

    await user.save();

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
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const response: ApiResponse = {
      success: true,
      message: "API token retrieved successfully",
      data: {
        token: user.apiToken || null,
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
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Revoke the token by setting it to null
    user.apiToken = null;
    user.updatedAt = new Date();

    await user.save();

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

// Helper function to generate secure API token
function generateApiToken(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  const buffer = Buffer.from(`${timestamp}_${random}`);
  return `wa_agent_${buffer.toString('base64url')}`;
}