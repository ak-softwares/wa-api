import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";

// GET profile
export async function GET() {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // ✅ Pick only required fields
    const filteredUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
    };

    const response: ApiResponse = {
      success: true,
      message: "Profile fetched successfully",
      data: filteredUser,
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
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { name, email, phone, company } = await req.json();

    if (!name || !email || !phone) {
      const response: ApiResponse = {
        success: false,
        message: "Name, email, and phone are required",
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // ✅ Check if email already exists in another account
    if (email !== user.email) {
      const existingUser = await User.findOne({ 
        email,
        _id: { $ne: user._id }   // 👈 exclude current user's own record 
      });
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
      const existingUser = await User.findOne({ 
        phone,
        _id: { $ne: user._id }   // 👈 exclude current user's own record
      });
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: "Phone number already in use by another account",
        };
        return NextResponse.json(response, { status: 400 });
      }
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
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles auth, DB, and token errors

    await User.findByIdAndDelete(user._id);
    
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
