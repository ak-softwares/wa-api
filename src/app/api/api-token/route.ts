import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../auth/[...nextauth]/authOptions";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select("apiToken");

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

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
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

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