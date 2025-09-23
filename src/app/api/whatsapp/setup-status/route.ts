// src/app/api/facebook/setup-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ApiResponse } from "@/types/apiResponse";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts) {
      const response: ApiResponse = {
        success: false,
        message: "No WA account found for this user",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const { permanent_token, is_phone_number_registered, is_app_subscribed } =
      user.waAccounts;

    const response: ApiResponse & {
      data: { token: boolean; phone: boolean; subscription: boolean };
    } = {
      success: true,
      message: "Fetched setup status successfully",
      data: {
        token: !!permanent_token,
        phone: !!is_phone_number_registered,
        subscription: !!is_app_subscribed,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error.message}`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
