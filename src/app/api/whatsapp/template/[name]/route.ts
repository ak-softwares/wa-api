import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import axios from "axios";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { WaAccount } from "@/types/WaAccount";

// DELETE /api/whatsapp/templates/[name]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

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

    const { waba_id, permanent_token } = wa;

    if (!waba_id || !permanent_token)
      return NextResponse.json({ success: false, message: "WA account not configured" }, { status: 400 });

    const { name } = await params;
    if (!name)
      return NextResponse.json({ success: false, message: "Template name is required" }, { status: 400 });


    // ✅ Delete from Facebook
    const fbUrl = `https://graph.facebook.com/v23.0/${waba_id}/message_templates?name=${name}`;
    try {
      await axios.delete(fbUrl, {
        headers: { Authorization: `Bearer ${permanent_token}` },
      });
    } catch (fbError: any) {
      return NextResponse.json(
        {
          success: false,
          message: `Facebook API error: ${
            fbError?.response?.data
              ? JSON.stringify(fbError.response.data)
              : fbError.message
          }`,
        },
        { status: 400 }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: "Template deleted successfully from Facebook",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${
          error?.response?.data
            ? JSON.stringify(error.response.data)
            : error.message
        }`,
      },
      { status: 500 }
    );
  }
}
