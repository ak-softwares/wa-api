// src/app/api/facebook/setup-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";

import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";

type StatusData = { token: boolean; phone: boolean; subscription: boolean };

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { permanent_token, is_phone_number_registered, is_app_subscribed } = waAccount;

    const data: StatusData = {
      token: !!permanent_token,
      phone: !!is_phone_number_registered,
      subscription: !!is_app_subscribed,
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
