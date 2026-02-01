import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ITool, ToolModel } from "@/models/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";
import { ToolPayload, ToolStatus } from "@/types/Tool";
import { getIntegratedToolsSafe } from "@/services/ai/aiSDK/tools/getTools";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse;

    const safeTools = await getIntegratedToolsSafe({ userId: user._id, waAccountId: waAccount._id });

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
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

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

    // credentials can be optional (some tools have no credentials)
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
      waAccountId: waAccount._id,
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
    const createdTool = await ToolModel.create({
      userId: user._id,
      waAccountId: waAccount._id,

      id: tool.id,
      name: tool.name || tool.id,
      category: tool.category,

      status: tool.status || ToolStatus.NOT_CONNECTED,
      active: typeof tool.active === "boolean" ? tool.active : true,

      credentials: tool.credentials || {}, // 🔐 encrypted by schema setter
    });

    // ✅ return safe tool
    const plain = createdTool.toObject({ getters: true });
    const safeTool = {
      ...plain,
      credentials: maskCredentialValues(createdTool.id, plain.credentials || {}),
    };

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