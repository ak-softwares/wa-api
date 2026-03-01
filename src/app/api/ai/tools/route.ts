import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ITool, ToolModel } from "@/models/Tool";
import { maskCredentialValues } from "@/lib/tools/maskCredentialValues";
import { ToolCatalog, ToolPayload } from "@/types/Tool";
import { getIntegratedToolsSafe } from "@/services/ai/tools/comman/getTools";
import { upsertTool } from "@/services/ai/tools/comman/upsertTool";
import { ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";
import { TOOLS_LIST } from "@/services/ai/tools/data/toolsList";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page"));
    const perPageParam = Number(searchParams.get("per_page"));
    const page = Math.max(pageParam || 1, 1);
    const perPage  = Math.min(Math.max(perPageParam || ITEMS_PER_PAGE, 1), MAX_ITEMS_PER_PAGE);
    const skip = (page - 1) * perPage;

    const safeTools: ITool[] = await getIntegratedToolsSafe({ userId: user._id });

    const integrationsById = new Map(
      safeTools.map((t) => [t.id, t])
    );

    const combinedTools: ToolCatalog[] = TOOLS_LIST.map((catalogTool) => {
      const integration = integrationsById.get(catalogTool.id);
      if (!integration) return catalogTool;

      return {
        ...catalogTool,
        _id: integration._id?.toString(),
        active: integration.active,
        status: integration.status,
        credentials: catalogTool.credentials.map((credential) => ({
          ...credential,
          value: integration.credentials?.[credential.key] || "",
        })),
        createdAt: integration.createdAt?.toString(),
        updatedAt: integration.updatedAt?.toString(),
      };
    });

    const total = TOOLS_LIST.length;
    const totalPages = Math.ceil(total / perPage);

    const paginatedTools = combinedTools.slice(skip, skip + perPage);

    const response: ApiResponse = {
      success: true,
      message: "Tools fetched successfully",
      data: {
        tools: paginatedTools,
        pagination: {
          page,
          per_page: perPage,
          total,
          total_pages: totalPages,
        },
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