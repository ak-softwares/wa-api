import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { requestVerificationCode } from "@/services/whatsappApi/requestAndVerifyCode";

// 📌 Request WhatsApp verification code
export async function POST(req: NextRequest) {
  try {
    const { waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { phone_number_id, permanent_token } = waAccount;

    // Optional: allow method override from body
    const { code_method } = await req.json();

    await requestVerificationCode({ phone_number_id, permanent_token, code_method });

    const response: ApiResponse = {
      success: true,
      message: "Verification code requested successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Request verification code failed";

    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };

    return NextResponse.json(response, {
      status: error.statusCode || 500,
    });
  }
}
