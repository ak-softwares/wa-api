import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

// GET - Fetch AI Agent configuration from the user document
export async function GET() {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Default fallback if config doesn't exist yet
    const aiAgentConfig = waAccount.aiAgent || {
      webhookUrl: "",
      prompt: "",
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
export async function PATCH(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { webhookUrl, isActive, prompt } = await req.json();

    // Update or initialize aiAgent configuration
    const now = new Date();

    waAccount.aiAgent = {
      prompt: prompt || waAccount.aiAgent?.prompt || "",
      webhookUrl: webhookUrl || waAccount.aiAgent?.webhookUrl || "",
      isActive: typeof isActive === "boolean" ? isActive : waAccount.aiAgent?.isActive || false,
      createdAt: waAccount.aiAgent?.createdAt || now,
      updatedAt: now,
    };

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "AI Agent configuration saved successfully",
      data: waAccount.aiAgent,
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