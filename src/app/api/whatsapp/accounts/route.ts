// src/app/api/whatsapp/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import axios from "axios";
import { WaAccount } from "@/types/WaAccount";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

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
    const newAccount = {
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
    };

    const index = user.waAccounts.findIndex((acc: WaAccount) => acc.phone_number_id === phone_number_id);

    if (index !== -1) {
      // ✅ update existing — keep default as it is OR override if you want
      user.waAccounts[index] = {
        ...user.waAccounts[index],
        ...newAccount,
        updatedAt: new Date(),
      };

      // ✅ Also mark this as the new default (since it's just been updated)
      user.defaultWaAccountId = user.waAccounts[index]._id;
    } else {
      // ✅ insert new account and mark as default
      user.waAccounts.push({
        ...newAccount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // ✅ Always set the new one as default
      const addedAccount = user.waAccounts[user.waAccounts.length - 1];
      user.defaultWaAccountId = addedAccount._id;
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

    // Step 3: Remove only default account from DB
    user.waAccounts = user.waAccounts.filter(
      (a: WaAccount) => a.phone_number_id !== phone_number_id
    );

    // ✅ Step 5: If deleted account was default, reset defaultWaAccountId
    if (user.defaultWaAccountId?.equals(waAccount._id)) {
      user.defaultWaAccountId = user.waAccounts.length > 0 ? user.waAccounts[0]._id : undefined;
    }
    
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