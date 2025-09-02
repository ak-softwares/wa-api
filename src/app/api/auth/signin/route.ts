import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { signInSchema } from "@/schemas/signInSchema";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input
    const validation = signInSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid request",
        errors: validation.error.flatten().fieldErrors,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { email, password } = validation.data;

    // ✅ Connect DB
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ✅ Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid credentials",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // ✅ Success
    const response: ApiResponse = {
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Something went wrong: " + (error as Error).message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
