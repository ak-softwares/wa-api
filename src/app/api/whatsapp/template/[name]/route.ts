import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

// DELETE /api/whatsapp/templates/[name]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    const { name } = await params;
    if (!name)
      return NextResponse.json({ success: false, message: "Template name is required" }, { status: 400 });


    // ✅ Delete from Facebook
    const fbUrl = `https://graph.facebook.com/v23.0/${waba_id}/message_templates?name=${name}`;
    try {
      await axios.delete(fbUrl, {
        headers: { Authorization: `Bearer ${permanent_token}` },
      });
    } catch (fbError: any) {
      return NextResponse.json(
        {
          success: false,
          message: `Facebook API error: ${
            fbError?.response?.data
              ? JSON.stringify(fbError.response.data)
              : fbError.message
          }`,
        },
        { status: 400 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: "Template deleted successfully from Facebook",
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
