import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import {
  clearResetPasswordRecord,
  getResetPasswordRecord,
  hashResetToken,
} from "@/lib/redis/resetPassword";

const PASSWORD_POLICY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,100}$/;

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();
    const sanitizedEmail = (email || "").trim().toLowerCase();

    if (!sanitizedEmail || !token || !newPassword) {
      const response: ApiResponse = {
        success: false,
        message: "All fields are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!PASSWORD_POLICY_REGEX.test(newPassword)) {
      const response: ApiResponse = {
        success: false,
        message:
          "Password must be 8-100 chars and include uppercase, lowercase, number, and special character",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const resetRecord = await getResetPasswordRecord(sanitizedEmail);

    if (!resetRecord || new Date(resetRecord.expiresAt).getTime() < Date.now()) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid or expired token",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const incomingTokenHash = hashResetToken(token);
    const recordBuffer = Buffer.from(resetRecord.tokenHash);
    const incomingBuffer = Buffer.from(incomingTokenHash);

    if (
      recordBuffer.length !== incomingBuffer.length ||
      !crypto.timingSafeEqual(recordBuffer, incomingBuffer)
    ) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid or expired token",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    const user = await UserModel.findOne({ email: sanitizedEmail });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    user.password = newPassword;
    await user.save();
    await clearResetPasswordRecord(sanitizedEmail);

    const response: ApiResponse = {
      success: true,
      message: "Password reset successful. Please login again.",
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}