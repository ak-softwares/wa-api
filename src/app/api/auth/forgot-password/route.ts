import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { sendMail } from "@/lib/mail";
import { BaseEmailTemplate } from "@/components/emails/BaseEmailTemplate";
import { ResetPasswordElement } from "@/components/emails/ResetPasswordTemlate";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      const response: ApiResponse = {
        success: false,
        message: "Email is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();


    // Reset link (in production, send via email)
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&email=${email}`;

    // 📧 Build email body
    const emailBody1 = BaseEmailTemplate({ firstName: email, children: ResetPasswordElement({ resetLink })})
    
    // 🚀 Send email
    const emailRes = await sendMail({
      to: email,
      subject: "Password Reset Request",
      react: emailBody1,
    });

    if (!emailRes.success) {
        const response: ApiResponse = {
          success: false,
          message: emailRes.message,
          // data: { resetLink }, // only for testing
        };
        return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Password reset link generated",
      // data: { resetLink }, // only for testing
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
