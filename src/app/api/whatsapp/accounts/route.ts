// src/app/api/whatsapp/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import axios from "axios";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { WaAccountModel } from "@/models/WaAccount";

// 📌 Full WhatsApp setup: exchange token → register phone → subscribe app
export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, waba_id, business_id, access_token } = await req.json();

    if (!phone_number_id || !waba_id || !business_id || !access_token) {
      const response: ApiResponse = { success: false, message: "Missing required fields" };
      return NextResponse.json(response, { status: 400 });
    }

    // ---------------- Step 1: Exchange token ----------------
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

    // ---------------- Step 2: Register Phone ----------------
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

    // ---------------- Step 3: Subscribe App ----------------
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

    // ---------------- Step 4: Get Phone number and name ----------------
    let phoneData: any = {};
    try {
      const url = `https://graph.facebook.com/v23.0/${waba_id}?fields=phone_numbers`;
      const fbRes = await fetch(url, {
        headers: { Authorization: `Bearer ${permanent_token}` },
      });

      const json = await fbRes.json();
      phoneData = json?.phone_numbers?.data?.[0] || {};
    } catch (err) {
      phoneData = {};
    }

    // ---------------- Step 5: Update & Save User ----------------
    // 5️⃣ Upsert WA Account (SEPARATE COLLECTION)
    const waAccount = await WaAccountModel.findOneAndUpdate(
      { userId: user._id, phone_number_id },
      {
        userId: user._id,
        phone_number_id,
        waba_id,
        business_id,
        permanent_token,
        verified_name: phoneData.verified_name || "",
        display_phone_number: phoneData.display_phone_number || "",
        quality_rating: phoneData.quality_rating || "",
        code_verification_status: phoneData.code_verification_status || "",
        is_phone_number_registered: phoneRegistered,
        is_app_subscribed: appSubscribed,
      },
      { upsert: true, new: true }
    );

    // 6️⃣ Always set latest as default
    user.defaultWaAccountId = waAccount._id;
    await user.save();


    // ---------------- Final Response ----------------
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
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message || "Unexpected error" };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token, waba_id } = waAccount;

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

    // 3️⃣ Delete WA account document
    await WaAccountModel.deleteOne({
      _id: waAccount._id,
      userId: user._id,
    });

    // 4️⃣ Reset default WA account
    const nextAccount = await WaAccountModel.findOne({ userId: user._id }).sort({ createdAt: 1 });

    // ✅ Step 5: If deleted account was default, reset defaultWaAccountId
    user.defaultWaAccountId = nextAccount ? nextAccount._id : undefined;
    
    await user.save();

    return NextResponse.json(
      { success: true, message: "Default WA Account deleted successfully" } as ApiResponse,
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Unexpected error" } as ApiResponse,
      { status: 500 }
    );
  }
}