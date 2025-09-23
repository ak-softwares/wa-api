// src/app/api/facebook/subscribe-app/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ApiResponse } from "@/types/apiResponse";
import { User } from "@/models/User";

// 📌 Subscribe App to WABA
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

    const { waba_id, permanent_token } = user.waAccounts;
    if (!waba_id || !permanent_token) {
      const response: ApiResponse = {
        success: false,
        message: "User WA account not configured properly",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Call WhatsApp Graph API to subscribe app
    const url = `https://graph.facebook.com/v23.0/${waba_id}/subscribed_apps`;
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    const fbResponse = await axios.post(url, {}, { headers });

    if (fbResponse.data?.success === true) {
      // ✅ Update user WA account in DB
      user.waAccounts.is_app_subscribed = true;
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

// 📌 Check subscription status
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

    const response: ApiResponse & { isSubscribed: boolean } = {
      success: true,
      message: "Fetched subscription status successfully",
      isSubscribed: !!user.waAccounts.is_app_subscribed,
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
