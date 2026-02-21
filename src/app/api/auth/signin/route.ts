import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { UserModel } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { signInSchema } from "@/schemas/signInSchema";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Validate input
    const validation = signInSchema.safeParse(body);
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

    const { email, password } = validation.data;

    // ✅ Connect DB
    await connectDB();
    const user = await UserModel.findOne({ email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "Invalid credentials",
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

    const token = generateToken({
      id: user._id.toString(),
    });

    // ✅ Success
    const response: ApiResponse = {
      success: true,
      message: "Login successful",
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
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Internal server error"
    };
    return NextResponse.json(response, { status: 500 });
  }
}
