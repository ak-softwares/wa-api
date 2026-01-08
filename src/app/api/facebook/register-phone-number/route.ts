import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { deregisterPhoneNumber, registerPhoneNumber } from "@/services/whatsappApi/registerPhoneNumber";

// 📌 Register phone number
export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { phone_number_id, permanent_token } = waAccount;

    await registerPhoneNumber({phone_number_id, permanent_token, pin: "000000"});

    waAccount.is_phone_number_registered = true;
    await waAccount.save();

    const response: ApiResponse = {
      success: true,
      message: "Phone number registered successfully",
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "Registration failed";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status:  error.statusCode || 500 });
  }
}

// 📌 Deregister phone number
export async function DELETE(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    
    const { phone_number_id, permanent_token } = waAccount;

    await deregisterPhoneNumber({phone_number_id, permanent_token });

    waAccount.is_phone_number_registered = false;
    await waAccount.save();
    
    const response: ApiResponse = {
      success: true,
      message: "Phone number deregistered successfully",
    };
    return NextResponse.json(response, { status: 200 });
    
  } catch (error: any) {
    // ✅ Extract only the message
    const message = error.response?.data?.error?.message || error.message || "Deregistration failed";
    
    const response: ApiResponse = {
      success: false,
      message: `Error: ${message}`,
    };
    return NextResponse.json(response, { status: error.statusCode || 500 });
  }
}
