// src/app/api/whatsapp/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// 📌 Full WhatsApp setup: exchange token → register phone → subscribe app
export async function POST(req: NextRequest) {
  try {

    // get logged-in user session
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    const { phone_number_id, waba_id, business_id, access_token } = await req.json();

    if (!phone_number_id || !waba_id || !business_id || !access_token) {
      const response: ApiResponse = { success: false, message: "Missing required fields" };
      return NextResponse.json(response, { status: 400 });
    }


    // ---------------- Step 1: Check user account ----------------
    await connectDB();
    const user = await User.findOne({ email: email });
    if (!user) {
      const response: ApiResponse = { success: false, message: "User not found" };
      return NextResponse.json(response, { status: 404 });
    }

    // ---------------- Step 2: Exchange token ----------------
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      code: access_token,
      grant_type: "authorization_code",
    });

    const fbRes = await fetch("https://graph.facebook.com/v23.0/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await fbRes.json();
    if (!fbRes.ok) {
      const response: ApiResponse = {
        success: false,
        message: data.error?.message || "Token exchange failed",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const permanent_token = data.access_token;

    // ---------------- Step 3: Register Phone ----------------
    let phoneRegistered = false;
    try {
      const regUrl = `https://graph.facebook.com/v23.0/${phone_number_id}/register`;
      const regPayload = { messaging_product: "whatsapp", pin: "000000" };
      await axios.post(regUrl, regPayload, {
        headers: { Authorization: `Bearer ${permanent_token}` },
      });
      phoneRegistered = true;
    } catch (err: any) {
      // silently fail, handled in final response
    }

    // ---------------- Step 4: Subscribe App ----------------
    let appSubscribed = false;
    try {
      const subUrl = `https://graph.facebook.com/v23.0/${waba_id}/subscribed_apps`;
      await axios.post(subUrl, {}, {
        headers: { Authorization: `Bearer ${permanent_token}` },
      });
      appSubscribed = true;
    } catch (err: any) {
      // silently fail, handled in final response
    }

    // ---------------- Step 5: Update & Save User ----------------
    user.waAccounts = {
      phone_number_id,
      waba_id,
      business_id,
      permanent_token,
      is_phone_number_registered: phoneRegistered,
      is_app_subscribed: appSubscribed,
    };
    await user.save();

    // ---------------- Final Response ----------------
    if (permanent_token) {
      return NextResponse.json(
        {
          success: true,
          message: "Setup completed successfully",
          data: {
            permanent_token: true,
            phone_registered: phoneRegistered,
            app_subscribed: appSubscribed,
          },
        } as ApiResponse,
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Token exchange failed",
        } as ApiResponse,
        { status: 500 }
      );
    }

  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message || "Unexpected error" };
    return NextResponse.json(response, { status: 500 });
  }
}
