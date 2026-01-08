import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { verifyVerificationCode } from "@/services/whatsappApi/requestAndVerifyCode";

// 📌 Verify WhatsApp verification code
export async function POST(req: NextRequest) {
  try {
    const { waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { phone_number_id, permanent_token } = waAccount;

    const { code } = await req.json();
    if (!code) {
        const response: ApiResponse = {
            success: false,
            message: "Verification code is required",
        };
        return NextResponse.json(response, { status: 400 });
    }

    await verifyVerificationCode({ phone_number_id, permanent_token, code });

    waAccount.is_phone_number_registered = true;
    await waAccount.save();

    const response: ApiResponse = {
      success: true,
      message: "Phone number verified successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "Verification failed";

    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };

    return NextResponse.json(response, {
      status: error.statusCode || 500,
    });
  }
}
