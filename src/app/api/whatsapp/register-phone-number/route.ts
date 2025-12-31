// src/app/api/whatsapp/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";

// 📌 Register phone number
export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token } = waAccount;

    // Call WhatsApp Cloud API register endpoint
    const url = `https://graph.facebook.com/v23.0/${phone_number_id}/register`;
    const payload = {
      messaging_product: "whatsapp",
      pin: "000000",
    };
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    const fbResponse = await axios.post(url, payload, { headers });

    if (fbResponse.data?.success === true) {
      // ✅ Update user WA account in DB
      waAccount.is_phone_number_registered = true;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: "Phone number registered successfully",
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message:
          "Registration failed" +
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

// 📌 Deregister phone number
export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    
    const { phone_number_id, permanent_token } = waAccount;

    // Call WhatsApp Cloud API deregister endpoint
    const url = `https://graph.facebook.com/v23.0/${phone_number_id}/deregister`;
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    const fbResponse = await axios.post(url, {}, { headers });

    if (fbResponse.data?.success === true) {
      // ✅ Update DB status
      waAccount.is_phone_number_registered = false;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: "Phone number deregistered successfully",
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message:
          "Deregistration failed" +
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
