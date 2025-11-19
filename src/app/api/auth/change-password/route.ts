import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types/apiResponse";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      const response: ApiResponse = { success: false, message: "All fields required" };
      return NextResponse.json(response, { status: 400 });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      const response: ApiResponse = { success: false, message: "Old password incorrect" };
      return NextResponse.json(response, { status: 400 });
    }

    user.password = newPassword;
    await user.save();

    const response: ApiResponse = { success: true, message: "Password updated. Please login again." };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = { success: false, message: err.message || "Unexpected error" };
    return NextResponse.json(response, { status: 500 });
  }
}
