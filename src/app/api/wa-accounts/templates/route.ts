import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { TemplateModel } from "@/models/Template";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";
import { TemplatesModule } from "@/services/whatsappApi/modules/TemplatesModule";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    // Pagination support from query params
    const { searchParams } = new URL(req.url);
    const perPageParam = Number(searchParams.get("limit"));
    const perPage  = Math.min(Math.max(perPageParam || ITEMS_PER_PAGE, 1), MAX_ITEMS_PER_PAGE);
    const after = searchParams.get("after") || null;

    const templatesModule = new TemplatesModule({
      waba_id,
      permanent_token,
    });

    const fbData = await templatesModule.getTemplates({
      limit: perPage,
      after,
    });

    const response: ApiResponse = {
      success: true,
      message: "Templates fetched successfully from Facebook",
      data: fbData.templates || [],
      pagination: fbData.paging,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    // Parse request
    const { name, category, language, components } = await req.json();
    // console.log("Received template creation request:", JSON.stringify({ components }));
    if (!name || !category || !language || !components) {
      const response: ApiResponse = {
        success: false,
        message: "Missing required fields ( name, category, language, components )",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const templatesModule = new TemplatesModule({
      waba_id,
      permanent_token,
    });

    // console.log("response: " + JSON.stringify(components, null, 2))

    const fbResponse = await templatesModule.createTemplate({
      name,
      category,
      language,
      components,
    });

    // ✅ Save in 
    const newTemplate = await TemplateModel.create({
      id: fbResponse.id, // Save FB template ID
      userId: user._id,
      waAccountId: waAccount._id,
      name,
      category: fbResponse.category || category,
      language,
      components,
      createdAt: new Date(),
    });

    const response: ApiResponse = {
      success: true,
      message: "Template created and verified with Facebook",
      data: newTemplate,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}