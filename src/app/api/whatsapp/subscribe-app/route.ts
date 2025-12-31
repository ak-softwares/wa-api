// src/app/api/facebook/subscribe-app/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";

// 📌 Subscribe App to WABA
export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    // Call WhatsApp Graph API to subscribe app
    const url = `https://graph.facebook.com/v23.0/${waba_id}/subscribed_apps`;
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    const fbResponse = await axios.post(url, {}, { headers });

    if (fbResponse.data?.success === true) {
      // ✅ Update user WA account in DB
      waAccount.is_app_subscribed = true;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: "App subscribed successfully to WABA",
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message:
          "Subscription failed" +
          (fbResponse.data?.error?.message
            ? `: ${fbResponse.data.error.message}`
            : ""),
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      }`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// 📌 Unsubscribe App from WABA
export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    
    const { waba_id, permanent_token } = waAccount;

    // Call WhatsApp Graph API to unsubscribe app
    const url = `https://graph.facebook.com/v23.0/${waba_id}/subscribed_apps`;
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    const fbResponse = await axios.delete(url, { headers });

    if (fbResponse.data?.success === true) {
      waAccount.is_app_subscribed = false;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: "App unsubscribed successfully from WABA",
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message:
          "Unsubscription failed" +
          (fbResponse.data?.error?.message
            ? `: ${fbResponse.data.error.message}`
            : ""),
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      }`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}