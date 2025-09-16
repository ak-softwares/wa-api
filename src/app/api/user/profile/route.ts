import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// GET profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).select(
      "name email phone company"
    );

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Profile fetched successfully",
      data: user,
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

// UPDATE profile
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    const { name, email, phone, company } = await req.json();

    if (!name || !email || !phone) {
      const response: ApiResponse = {
        success: false,
        message: "All fields are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    
    // ✅ Check if email already exists in another account
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: "Email already in use by another account",
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // ✅ Check if phone is being changed & ensure it's unique
    if (phone !== user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: "Phone number already in use by another account",
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.company = company;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "Profile updated successfully",
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

// DELETE profile
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOneAndDelete({ email: session.user.email });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Account deleted successfully",
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
