import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { signUpSchema } from "@/schemas/signUpSchema";
import { generateToken } from "@/lib/auth/jwt";

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

    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: "User already exists",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Create new user
    const user = new UserModel({
      name,
      email,
      phone,
      password,
    });
    await user.save();

    const token = generateToken({
      id: user._id.toString(),
    });

    const response: ApiResponse = {
      success: true,
      message: "User signed up successfully",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      },
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      const response: ApiResponse = {
        success: false,
        message: "User already exists",
      };
      return NextResponse.json(response, { status: 500 });
    }
    const response: ApiResponse = {
      success: false,
      message: "Internal server error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
