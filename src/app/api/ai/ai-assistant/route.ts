import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { AIAssistantModel } from "@/models/AIAssistant";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const aiAssistant = await AIAssistantModel.findOne({ userId: user._id }).lean();

    const response: ApiResponse = {
      success: true,
      message: "AI assistant configuration fetched successfully",
      data: aiAssistant || {
        prompt: "",
        isActive: false,
        messageLimit: 20,
        limitWindowInHours: 1,
      },
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

    const { prompt, isActive, messageLimit, limitWindowInHours } = await req.json();

    const updatedAssistant = await AIAssistantModel.findOneAndUpdate(
      { userId: user._id },
      {
        ...(prompt !== undefined ? { prompt } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
        ...(Number.isFinite(messageLimit) ? { messageLimit: Math.max(1, Number(messageLimit)) } : {}),
        ...(Number.isFinite(limitWindowInHours)
          ? { limitWindowInHours: Math.max(1, Number(limitWindowInHours)) }
          : {}),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    const response: ApiResponse = {
      success: true,
      message: "AI assistant configuration saved successfully",
      data: updatedAssistant,
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
