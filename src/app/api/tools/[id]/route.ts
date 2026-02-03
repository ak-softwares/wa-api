import { NextRequest, NextResponse } from "next/server";
import { ToolModel } from "@/models/Tool";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { ToolPayload } from "@/types/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { id } = await params;

    const tool: ToolPayload = await req.json();

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: "toolId is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // credentials optional
    if (tool.credentials && typeof tool.credentials !== "object") {
      const response: ApiResponse = {
        success: false,
        message: "credentials must be an object",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ find tool by Mongo _id + user scope
    const existingTool = await ToolModel.findOne({
      _id: id,
      userId: user._id,
      waAccountId: user.defaultWaAccountId,
    });

    if (!existingTool) {
      const response: ApiResponse = {
        success: false,
        message: "Tool not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ✅ update only provided fields
    if (typeof tool.active === "boolean") {
      existingTool.active = tool.active;
    }

    if (tool.status) {
      existingTool.status = tool.status;
    }

    if (tool.credentials) {
      const cleanedCredentials = Object.fromEntries(
        Object.entries(tool.credentials).filter(([_, v]) => v !== "")
      );

      existingTool.credentials = {
        ...(existingTool.credentials || {}),
        ...cleanedCredentials,
      };
    }

    await existingTool.save();
    // ✅ return safe tool (decrypt + mask)
    const plain = existingTool.toObject({ getters: true });
    const safeTool = {
      ...plain,
      credentials: maskCredentialValues(existingTool.id, plain.credentials || {}),
    };

    const response: ApiResponse = {
      success: true,
      message: "Tool updated successfully",
      data: safeTool,
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


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { id } = await params;

    if (!id) {
      const response: ApiResponse = {
        success: false,
        message: "toolId is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ delete tool by Mongo _id + user scope
    const deletedTool = await ToolModel.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!deletedTool) {
      const response: ApiResponse = {
        success: false,
        message: "Tool not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Tool deleted successfully",
      data: { _id: deletedTool._id },
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