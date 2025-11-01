import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

// GET - Fetch AI configuration from the user document
export async function GET() {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Default fallback if config doesn't exist yet
    const aiChat = waAccount.aiChat || {
      prompt: "",
      isActive: false,
    };

    const response: ApiResponse = {
      success: true,
      message: "AI configuration fetched successfully",
      data: aiChat,
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
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { prompt, isActive } = await req.json();

    // Update or initialize aiChat
    waAccount.aiChat = {
      prompt: prompt || waAccount.aiChat?.prompt || "",
      isActive: typeof isActive === "boolean" ? isActive : waAccount.aiChat?.isActive || false,
      createdAt: waAccount.aiChat?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "AI configuration saved successfully",
      data: waAccount.aiChat,
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
