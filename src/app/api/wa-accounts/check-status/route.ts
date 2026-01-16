import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";

import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { WaSetupStatus } from "@/types/WabaAccount";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const data: WaSetupStatus = {
      isTokenAvailable: !!waAccount?.permanent_token,
      isPhoneRegistered: !!waAccount?.is_phone_number_registered,
      isAppSubscription: !!waAccount?.is_app_subscribed,
      isPhoneVerified: waAccount?.wabaAccount?.phone_numbers?.[0]?.code_verification_status === "VERIFIED",
      wabaAccountStatus: waAccount?.wabaAccount?.account_review_status || "UNKNOWN",
    };

    const response: ApiResponse = {
      success: true,
      message: "Fetched setup status successfully",
      data,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error.message}`,
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
