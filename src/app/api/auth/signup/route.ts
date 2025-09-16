import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate body with Zod
    const validation = signUpSchema.safeParse(body);
    if (!validation.success) {
      // Collect all error messages into one string
      const errors = Object.values(validation.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean)
        .join(", ");
      const response: ApiResponse = {
        success: false,
        message:  errors || "Invalid request",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { name, email, phone, password } = validation.data;

    // ✅ Connect DB
    await connectDB();

    // ✅ Check if email already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      const response: ApiResponse = {
        success: false,
        message: "Email already in use",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Check if phone already exists
    const existingUserByPhone = await User.findOne({ phone });
    if (existingUserByPhone) {
      const response: ApiResponse = {
        success: false,
        message: "Phone number already in use",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Create new user
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
