import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { TemplatesModule } from "@/services/whatsappApi/modules/TemplatesModule";

export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // Auth / DB / token failures handled automatically

    const { waba_id, permanent_token } = waAccount;

    // 🔥 Get template names array from body
    const body = await req.json();
    const templateNames: string[] = body?.names;

    if (!templateNames || !Array.isArray(templateNames) || templateNames.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "Template names array is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const templatesModule = new TemplatesModule({
      waba_id,
      permanent_token,
    });

    const fbResponse = await templatesModule.deleteTemplates(templateNames);

    const response: ApiResponse = {
      success: true,
      message: "Bulk delete process completed",
      data: fbResponse,
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
