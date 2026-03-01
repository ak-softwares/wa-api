import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // Default fallback if config doesn't exist yet
    const aiAssistant = user.aiAssistant || {
      prompt: "",
      isActive: false,
    };

    const response: ApiResponse = {
      success: true,
      message: "AI assistant configuration fetched successfully",
      data: aiAssistant,
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

export async function PATCH(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { prompt, isActive } = await req.json();

    // Update or initialize aiAssistant
    user.aiAssistant = {
      prompt: prompt || user.aiAssistant?.prompt || "",
      isActive: typeof isActive === "boolean" ? isActive : user.aiAssistant?.isActive || false,
      createdAt: user.aiAssistant?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "AI assistant configuration saved successfully",
      data: user.aiAssistant,
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
