import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { sendWhatsAppOtp } from "@/services/auth/sendWhatsAppOtp";
import { getOtpRecord, saveOtpRecord } from "@/lib/redis/otp";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      const response: ApiResponse = {
        success: false,
        message: "Phone is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const now = new Date();

    // Check existing OTP
    const existing = await getOtpRecord(phone);

    // ✅ Rate limit resend (60 sec)
    if (existing && now.getTime() - new Date(existing.lastSentAt).getTime() < 60000) {
      const response: ApiResponse = {
        success: false,
        message: "Please wait before requesting another OTP",
      };
      return NextResponse.json(response, { status: 429 });
    }

    // ✅ Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Upsert OTP
    await saveOtpRecord(phone, {
      code: otp,
      attempts: 0,
      expiresAt: expiresAt.toISOString(),
      lastSentAt: now.toISOString(),
    });

    // ✅ Send via WhatsApp
    const waResponse = await sendWhatsAppOtp({phone, otp});

    if (!waResponse.success) {
      const response: ApiResponse = {
        success: false,
        message: waResponse.message || "Failed to send OTP",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      message: "OTP sent via WhatsApp successfully",
      data: {
        expiresAt: expiresAt,
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

