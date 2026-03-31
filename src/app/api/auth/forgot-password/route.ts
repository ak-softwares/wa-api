import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { sendMail } from "@/lib/mail";
import { BaseEmailTemplate } from "@/components/emails/BaseEmailTemplate";
import { ResetPasswordElement } from "@/components/emails/ResetPasswordTemlate";
import {
  getResetPasswordRecord,
  hashResetToken,
  saveResetPasswordRecord,
} from "@/lib/redis/resetPassword";
import { sendWhatsAppResetLink } from "@/services/auth/sendWhatsAppResetLink";

type DeliveryMethod = "email" | "whatsapp";

export async function POST(req: Request) {
  try {
    const { email, delivery = "email" } = await req.json();

    const sanitizedEmail = (email || "").trim().toLowerCase();

    if (!sanitizedEmail) {
      const response: ApiResponse = {
        success: false,
        message: "Email is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!["email", "whatsapp"].includes(delivery)) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid delivery option",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const existingRecord = await getResetPasswordRecord(sanitizedEmail);
    if (
      existingRecord &&
      Date.now() - new Date(existingRecord.lastSentAt).getTime() < 60_000
    ) {
      const response: ApiResponse = {
        success: false,
        message: "Please wait before requesting another reset link",
      };
      return NextResponse.json(response, { status: 429 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: sanitizedEmail });

    if (!user) {
      const response: ApiResponse = {
        success: true,
        message: "If this email exists, a reset link has been sent",
      };
      return NextResponse.json(response, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await saveResetPasswordRecord(sanitizedEmail, {
      tokenHash: hashResetToken(resetToken),
      expiresAt: expiresAt.toISOString(),
      lastSentAt: new Date().toISOString(),
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&email=${sanitizedEmail}`;

    const selectedDelivery = delivery as DeliveryMethod;

    if (selectedDelivery === "email") {
      const emailBody1 = BaseEmailTemplate({
        firstName: sanitizedEmail,
        children: ResetPasswordElement({ resetLink }),
      });

      const emailRes = await sendMail({
        to: sanitizedEmail,
        subject: "Password Reset Request",
        react: emailBody1,
      });

      if (!emailRes.success) {
        const response: ApiResponse = {
          success: false,
          message: emailRes.message,
        };
        return NextResponse.json(response, { status: 500 });
      }
    }

    if (selectedDelivery === "whatsapp") {
      const waRes = await sendWhatsAppResetLink({
        phone: String(user.phone),
        resetTokenFullParam: `?token=${resetToken}&email=${sanitizedEmail}`,
      });

      if (!waRes.success) {
        const response: ApiResponse = {
          success: false,
          message: waRes.message,
        };
        return NextResponse.json(response, { status: 500 });
      }
    }

    const response: ApiResponse = {
      success: true,
      message: `Password reset link sent via ${selectedDelivery}`,
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