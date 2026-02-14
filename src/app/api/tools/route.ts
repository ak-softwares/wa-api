import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ITool, ToolModel } from "@/models/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";
import { ToolPayload, ToolStatus } from "@/types/Tool";
import { getIntegratedToolsSafe } from "@/services/ai/tools/comman/getTools";
import { upsertTool } from "@/services/ai/tools/comman/upsertTool";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const safeTools = await getIntegratedToolsSafe({ userId: user._id });

    const response: ApiResponse = {
      success: true,
      message: "Tools fetched successfully",
      data: safeTools,
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

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const tool: ToolPayload = await req.json();

    if (!tool || typeof tool !== "object") {
      const response: ApiResponse = {
        success: false,
        message: "tool object is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!tool.id) {
      const response: ApiResponse = {
        success: false,
        message: "tool.id is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (tool.credentials && typeof tool.credentials !== "object") {
      const response: ApiResponse = {
        success: false,
        message: "credentials must be an object",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ check already exists
    const existing = await ToolModel.findOne({
      userId: user._id,
      id: tool.id,
    });

    if (existing) {
      const response: ApiResponse = {
        success: false,
        message: "Tool already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    // ✅ create
    const safeTool = await upsertTool({
      userId: user._id,
      waAccountId: user.defaultWaAccountId,
      tool,
    });

    const response: ApiResponse = {
      success: true,
      message: "Tool integration created successfully",
      data: safeTool,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}