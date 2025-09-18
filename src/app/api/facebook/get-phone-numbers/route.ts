import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import { ApiResponse } from "@/types/apiResponse";
import { getServerSession } from "next-auth"


export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    const email = session?.user?.email

    if (!email) {
      const response: ApiResponse = {
        success: false,
        message: "User email not found in session",
      };
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

    const { waba_id, permanent_token } = user.waAccounts;
    if (!waba_id || !permanent_token) {
      const response: ApiResponse = {
        success: false,
        message: "User WA account not configured properly",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Call Facebook Graph API
    const url = `https://graph.facebook.com/v21.0/${waba_id}?fields=phone_numbers`;
    const fbRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${permanent_token}`,
      },
    });
    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      const response: ApiResponse = {
        success: false,
        message: fbData.error?.message || "Failed to fetch phone numbers",
      };
      return NextResponse.json(response, { status: fbRes.status });
    }

    const response: ApiResponse = {
      success: true,
      message: "Phone numbers fetched successfully",
      data: fbData.phone_numbers?.data || [],
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
