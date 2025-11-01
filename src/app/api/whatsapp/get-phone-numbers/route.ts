import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    // Call Facebook Graph API
    const url = `https://graph.facebook.com/v23.0/${waba_id}?fields=phone_numbers`;
    const fbRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${permanent_token}`,
      },
    });
    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      const response: ApiResponse = {
        success: false,
        message: fbData.error?.message || "Failed to fetch phone numbers",
      };
      return NextResponse.json(response, { status: fbRes.status });
    }

    const response: ApiResponse = {
      success: true,
      message: "Phone numbers fetched successfully",
      data: fbData.phone_numbers?.data || [],
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
