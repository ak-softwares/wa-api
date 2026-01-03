import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";

// DELETE /api/whatsapp/templates/bulk
export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // Auth / DB / token failures handled automatically

    const { waba_id, permanent_token } = waAccount;

    // 🔥 Get template names array from body
    const body = await req.json();
    const templates: string[] = body?.names;

    if (!templates || !Array.isArray(templates) || templates.length === 0) {
      return NextResponse.json(
        { success: false, message: "Template names array is required" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    // 🔥 Bulk delete each template independently
    for (const name of templates) {
      const fbUrl = `https://graph.facebook.com/v23.0/${waba_id}/message_templates?name=${encodeURIComponent(
        name
      )}`;

      try {
        await axios.delete(fbUrl, {
          headers: { Authorization: `Bearer ${permanent_token}` },
        });

        results.push({ name, success: true });
      } catch (fbError: any) {
        results.push({
          name,
          success: false,
          error: fbError?.response?.data
            ? JSON.stringify(fbError.response.data)
            : fbError.message,
        });
      }
    }

    // 🔥 Final response
    const response: ApiResponse = {
      success: true,
      message: "Bulk delete process completed",
      data: results,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`,
      },
      { status: 500 }
    );
  }
}
