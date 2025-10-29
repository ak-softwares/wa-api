// src/app/api/whatsapp/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import axios from "axios";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { WaAccount } from "@/types/WaAccount";

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
    const newAccount = {
      phone_number_id,
      waba_id,
      business_id,
      permanent_token,
      is_phone_number_registered: phoneRegistered,
      is_app_subscribed: appSubscribed,
      default: true,
    };

    const index = user.waAccounts.findIndex((acc: WaAccount) => acc.phone_number_id === phone_number_id);

    if (index !== -1) {
      // ✅ update existing — keep default as it is OR override if you want
      user.waAccounts[index] = {
        ...user.waAccounts[index],
        ...newAccount,
        updatedAt: new Date(),
      };
    } else {
      // ✅ insert new account and mark as default
      user.waAccounts.push({
        ...newAccount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await user.save();


    // ---------------- Final Response ----------------
    if (permanent_token) {
      const response: ApiResponse = {
        success: true,
        message: "Setup completed successfully",
        data: {
          permanent_token: true,
          phone_registered: phoneRegistered,
          app_subscribed: appSubscribed,
        },
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message: "Token exchange failed",
      };
      return NextResponse.json(response, { status: 500 });
    }
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message || "Unexpected error" };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" } as ApiResponse,
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user || !Array.isArray(user.waAccounts)) {
      return NextResponse.json(
        { success: false, message: "No WA accounts found" } as ApiResponse,
        { status: 404 }
      );
    }

    // ✅ find default account
    const acc = user.waAccounts.find((a: WaAccount) => a.default === true);
    if (!acc) {
      return NextResponse.json(
        { success: false, message: "Default WA Account not found" } as ApiResponse,
        { status: 404 }
      );
    }

    const { phone_number_id, permanent_token, waba_id } = acc;
    if (!permanent_token) {
      return NextResponse.json(
        { success: false, message: "WA account not configured properly" } as ApiResponse,
        { status: 400 }
      );
    }

    // Step 1: Deregister
    try {
      await axios.post(
        `https://graph.facebook.com/v23.0/${phone_number_id}/deregister`,
        {},
        { headers: { Authorization: `Bearer ${permanent_token}` } }
      );
    } catch {}

    // Step 2: Unsubscribe
    try {
      if (waba_id) {
        await axios.delete(
          `https://graph.facebook.com/v23.0/${waba_id}/subscribed_apps`,
          { headers: { Authorization: `Bearer ${permanent_token}` } }
        );
      }
    } catch {}

    // Step 3: Remove only default account from DB
    user.waAccounts = user.waAccounts.filter(
      (a: WaAccount) => a.phone_number_id !== phone_number_id
    );
    await user.save();

    return NextResponse.json(
      { success: true, message: "Default WA Account deleted successfully", data: acc } as ApiResponse,
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Unexpected error" } as ApiResponse,
      { status: 500 }
    );
  }
}