import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../[...nextauth]/authOptions"; 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      const response: ApiResponse = { success: false, message: "All fields required" };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      const response: ApiResponse = { success: false, message: "User not found" };
      return NextResponse.json(response, { status: 404 });
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
