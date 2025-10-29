import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { WaAccount } from "@/types/WaAccount";

// GET - Fetch AI configuration from the user document
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
    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.waAccounts || user.waAccounts.length === 0) {
      const response: ApiResponse = { success: false, message: "No WA account found", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);

    if (!wa) {
      const response: ApiResponse = { success: false, message: "No default WA account", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    // Default fallback if config doesn't exist yet
    const aiConfig = wa.aiConfig || {
      prompt: "",
      isActive: false,
    };

    const response: ApiResponse = {
      success: true,
      message: "AI configuration fetched successfully",
      data: aiConfig,
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

// POST - Update AI configuration inside user document
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const { prompt, isActive } = await req.json();

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.waAccounts || user.waAccounts.length === 0) {
      const response: ApiResponse = { success: false, message: "No WA account found", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);

    if (!wa) {
      const response: ApiResponse = { success: false, message: "No default WA account", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    // Update or initialize aiConfig
    wa.aiConfig = {
      prompt: prompt || wa.aiConfig?.prompt || "",
      isActive: typeof isActive === "boolean" ? isActive : wa.aiConfig?.isActive || false,
      createdAt: wa.aiConfig?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "AI configuration saved successfully",
      data: wa.aiConfig,
    };

    return NextResponse.json(response.data, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
