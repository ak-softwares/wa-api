import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate body with Zod
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid request",
        errors: validation.error.flatten().fieldErrors,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { name, email, phone, password } = validation.data;

    // ✅ Connect DB
    await connectDB();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: "User already exists",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
    });
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "User signed up successfully",
      data: { id: user._id, name, email, phone },
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Something went wrong: " + (error as Error).message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
