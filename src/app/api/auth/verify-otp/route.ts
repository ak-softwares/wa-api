import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { UserModel } from "@/models/User";
import { clearOtpRecord, getOtpRecord, saveOtpRecord } from "@/lib/redis/otp";
import { generateToken } from "@/lib/auth/jwt";

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

    const otpDoc = await getOtpRecord(phone);

    if (!otpDoc) {
      const response: ApiResponse = {
        success: false,
        message: "OTP not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (new Date(otpDoc.expiresAt) < new Date()) {
      await clearOtpRecord(phone);
      const response: ApiResponse = {
        success: false,
        message: "OTP expired",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Max attempts check
    if (otpDoc.attempts >= 3) {
      await clearOtpRecord(phone);
      const response: ApiResponse = {
        success: false,
        message: "Too many attempts",
      };
      return NextResponse.json(response, { status: 429 });
    }

    if (otpDoc.code !== otp) {
      otpDoc.attempts += 1;
      await saveOtpRecord(phone, otpDoc);

      const response: ApiResponse = {
        success: false,
        message: "Invalid OTP",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // OTP correct → delete
    await clearOtpRecord(phone);

    // Find or create user
    let user = await UserModel.findOne({ phone });

    if (!user) {
      const response: ApiResponse = {
          success: false,
          message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // JWT
    const token = generateToken({
      id: user._id.toString(),
    });

    const response: ApiResponse = {
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Internal server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
