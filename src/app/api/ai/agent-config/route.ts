// app/api/ai-agent/config/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// GET - Fetch AI Agent configuration from the user document
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
    const user = await User.findOne({ email: session.user.email }).select("aiAgent");

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Default fallback if config doesn't exist yet
    const aiAgentConfig = user.aiAgent || {
      webhookUrl: "",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const response: ApiResponse = {
      success: true,
      message: "AI Agent configuration fetched successfully",
      data: aiAgentConfig,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Update AI Agent configuration inside user document
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const { webhookUrl, isActive } = await req.json();

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update or initialize aiAgent configuration
    const now = new Date();
    
    user.aiAgent = {
      webhookUrl: webhookUrl || user.aiAgent?.webhookUrl || "",
      isActive: typeof isActive === "boolean" ? isActive : user.aiAgent?.isActive || false,
      createdAt: user.aiAgent?.createdAt || now,
      updatedAt: now,
    };

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "AI Agent configuration saved successfully",
      data: user.aiAgent,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}