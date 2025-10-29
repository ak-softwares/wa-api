// src/app/api/facebook/setup-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { ApiResponse } from "@/types/apiResponse";
import { User } from "@/models/User";
import { WaAccount } from "@/types/WaAccount";

type StatusData = { token: boolean; phone: boolean; subscription: boolean };

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized", data: null };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts || user.waAccounts.length === 0) {
      const response: ApiResponse = { success: false, message: "No WA account found", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);

    if (!wa) {
      const response: ApiResponse = { success: false, message: "No default WA account", data: null };
      return NextResponse.json(response, { status: 404 });
    }

    const { permanent_token, is_phone_number_registered, is_app_subscribed } = wa;

    const data: StatusData = {
      token: !!permanent_token,
      phone: !!is_phone_number_registered,
      subscription: !!is_app_subscribed,
    };

    const response: ApiResponse = {
      success: true,
      message: "Fetched setup status successfully",
      data,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error.message}`,
      data: null,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
