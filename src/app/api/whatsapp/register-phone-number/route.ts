// src/app/api/whatsapp/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ApiResponse } from "@/types/apiResponse";
import { User } from "@/models/User";

// 📌 Register phone number
export async function POST(req: NextRequest) {
  try {
    // get logged-in user session
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user || !user.waAccounts) {
      const response: ApiResponse = {
        success: false,
        message: "No WA account found for this user",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { phone_number_id, permanent_token } = user.waAccounts;
    if (!phone_number_id || !permanent_token) {
      const response: ApiResponse = {
        success: false,
        message: "User WA account not configured properly",
      };
      return NextResponse.json(response, { status: 400 });
    }

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
      user.waAccounts.is_phone_number_registered = true;
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

// 📌 Check registration status
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts) {
      const response: ApiResponse = {
        success: false,
        message: "No WA account found for this user",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse & { isRegistered: boolean } = {
      success: true,
      message: "Fetched status successfully",
      isRegistered: !!user.waAccounts.is_phone_number_registered,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error.message}`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}