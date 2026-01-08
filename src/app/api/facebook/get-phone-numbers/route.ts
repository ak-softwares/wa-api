import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { getPhoneNumbers } from "@/services/whatsappApi/getPhoneNumber";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    const phoneNumbers = await getPhoneNumbers({waba_id, permanent_token });

    const response: ApiResponse = {
      success: true,
      message: "Phone numbers fetched successfully",
      data: phoneNumbers,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "Failed to fetch phone numbers";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status:  error.statusCode || 500 });
  }
}
