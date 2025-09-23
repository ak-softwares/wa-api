import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // if you're using next-auth
import { ApiResponse } from "@/types/apiResponse";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    // ✅ Get current logged-in user
    const session = await getServerSession();
    if (!session?.user?.email) {
      const res: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(res, { status: 401 });
    }

    // ✅ Find user in DB
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      const res: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(res, { status: 404 });
    }

    // ✅ Check facebook connection fields
    const rawToken = user?.waAccounts?._doc?.permanent_token; 
    const hasToken = !!rawToken;

    const res: ApiResponse = {
      success: hasToken,
      message: hasToken ? "Facebook account connected" : "Facebook account not connected",
    };

    return NextResponse.json(res, { status: 200 });


  } catch (err: any) {
    console.error("Error checking Facebook status:", err);
    const res: ApiResponse = {
      success: false,
      message: "Server error",
    };
    return NextResponse.json(res, { status: 500 });
  }
}
