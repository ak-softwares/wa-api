// src/app/api/wa-accounts/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser, getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { IWabaAccount, WaAccountModel } from "@/models/WaAccount";
import { getWabaDetails } from "@/services/whatsappApi/getPhoneNumber";
import { subscribeApp } from "@/services/whatsappApi/subscribeApp";
import { deregisterPhoneNumber, registerPhoneNumber } from "@/services/whatsappApi/registerPhoneNumber";
import { exchangeFacebookToken } from "@/services/whatsappApi/exchangeFacebookToken";

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
    const permanent_token = await exchangeFacebookToken({ access_token });

    // ---------------- Step 2: Register Phone ----------------
    const phoneRegistered = await registerPhoneNumber({ phone_number_id, permanent_token, pin: "000000" })
                                    .then(() => true).catch(() => false);

    // ---------------- Step 3: Subscribe App ----------------
    const appSubscribed = await subscribeApp({ waba_id, permanent_token })
                                  .then(() => true).catch(() => false);

    // ---------------- Step 4: Get Phone number and name ----------------
    const wabaAccount: IWabaAccount | null = await getWabaDetails({ waba_id, permanent_token })
                                  .catch(() => null); // It ignores the error. It returns an empty array []

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
        wabaAccount: wabaAccount ?? undefined,
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
  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "Failed to exchange token";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status:  error.statusCode || 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token, waba_id } = waAccount;

    // ---------------- Step 1: Deregister Phone ----------------
    await deregisterPhoneNumber({ phone_number_id, permanent_token }).catch(() => null);

    // ---------------- Step 2: Unsubscribe App ----------------
    await subscribeApp({ waba_id, permanent_token }).catch(() => null);

    // 3️⃣ Delete WA account document
    await WaAccountModel.deleteOne({ _id: waAccount._id });

    // 4️⃣ Reset default WA account
    const nextAccount = await WaAccountModel.findOne({ userId: user._id }).sort({ createdAt: 1 });

    // ✅ Step 5: If deleted account was default, reset defaultWaAccountId
    user.defaultWaAccountId = nextAccount ? nextAccount._id : undefined;
    
    await user.save();

    const response: ApiResponse = { success: true, message: "Default WA Account deleted successfully" };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message || "Unexpected error" };
    return NextResponse.json(response, { status: 500 });
  }
}