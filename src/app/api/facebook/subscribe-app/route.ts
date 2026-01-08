import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { subscribeApp, unsubscribeApp } from "@/services/whatsappApi/subscribeApp";

// 📌 Subscribe App to WABA
export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    await subscribeApp({ waba_id, permanent_token });

    waAccount.is_app_subscribed = true;
    await waAccount.save();

    const response: ApiResponse = {
      success: true,
      message: "App subscribed successfully to WABA",
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "App subscription failed";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status: error.statusCode || 500 });
  }
}

// 📌 Unsubscribe App from WABA
export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    
    const { waba_id, permanent_token } = waAccount;

    await unsubscribeApp({ waba_id, permanent_token });

    waAccount.is_app_subscribed = false;
    await waAccount.save();

    const response: ApiResponse = {
      success: true,
      message: "App unsubscribed successfully from WABA",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "App unsubscribed failed";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status: error.statusCode || 500 });
  }
}