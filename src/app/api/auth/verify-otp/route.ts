import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { connectDB } from "@/lib/mongoose";
import { UserModel } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      const response: ApiResponse = {
        success: false,
        message: "Phone and OTP required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    globalThis.otpStore = globalThis.otpStore || {};
    const entry = globalThis.otpStore[phone];

    if (!entry) {
      const response: ApiResponse = {
        success: false,
        message: "OTP not found or expired",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { code, expiresAt } = entry;

    if (Date.now() > expiresAt) {
      delete globalThis.otpStore[phone];
      const response: ApiResponse = {
        success: false,
        message: "OTP expired",
      };
      return NextResponse.json(response, { status: 410 });
    }

    if (code === otp) {
      delete globalThis.otpStore[phone];
        // ✅ Connect DB
        await connectDB();
        const user = await UserModel.findOne({ phone });
        if (!user) {
            const response: ApiResponse = {
                success: false,
                message: "User not found",
            };
            return NextResponse.json(response, { status: 404 });
        }
        const response: ApiResponse = {
            success: true,
            message: "OTP verified successfully - " + `token-${phone}-${Date.now()}`,
            data: { id: user._id, name: user.name, email: user.email, phone: user.phone },
        };
        return NextResponse.json(response, { status: 200 });
    }

    const response: ApiResponse = {
      success: false,
      message: "Invalid OTP",
    };
    return NextResponse.json(response, { status: 401 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
