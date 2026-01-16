import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { getWabaDetails } from "@/services/whatsappApi/getPhoneNumber";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    const wabaDetails = await getWabaDetails({waba_id, permanent_token });

    const response: ApiResponse = {
      success: true,
      message: "Waba Details fetched successfully",
      data: wabaDetails,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "Failed to fetch Waba Details";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status:  error.statusCode || 500 });
  }
}
