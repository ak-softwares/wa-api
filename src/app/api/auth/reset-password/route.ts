import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";

export async function POST(req: Request) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      const response: ApiResponse = {
        success: false,
        message: "All fields are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid or expired token",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Hash new password
    user.password = newPassword;

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

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
