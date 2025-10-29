import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "@/models/User";
import { Template } from "@/models/Template";
import { ApiResponse } from "@/types/apiResponse";
import { WaAccount } from "@/types/WaAccount";


export async function GET(req: NextRequest) {
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
      return NextResponse.json(
        { success: false, message: "User WA account not configured properly" },
        { status: 400 }
      );

    // Pagination support from query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const after = searchParams.get("after") || null;

    // Facebook Graph API endpoint
    let fbUrl = `https://graph.facebook.com/v23.0/${waba_id}/message_templates?limit=${limit}`;
    if (after) fbUrl += `&after=${after}`;

    const fbHeaders = {
      Authorization: `Bearer ${permanent_token}`,
    };

    // Fetch templates from Facebook
    const fbResponse = await axios.get(fbUrl, { headers: fbHeaders });

    const templates = fbResponse.data?.data || [];
    const paging = fbResponse.data?.paging || {};

    return NextResponse.json(
      {
        success: true,
        message: "Templates fetched successfully from Facebook",
        data: templates,
        pagination: paging, // includes 'next' and 'cursors' if available
      },
      { status: 200 }
    );
  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        message: `Error fetching templates: ${
          error.response?.data?.error?.message || error.message
        }`,
        details: error.response?.data,
      },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email)
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts || user.waAccounts.length === 0) {
      return NextResponse.json({ success: false, message: "No WA account found" }, { status: 404 });
    }
    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);
    if (!wa) {
      return NextResponse.json({ success: false, message: "No default WA account" }, { status: 404 });
    }
    const { waba_id, permanent_token } = wa;
    if (!waba_id || !permanent_token) {
      return NextResponse.json({ success: false, message: "WA account not configured" }, { status: 400 });
    }

    // Parse request
    const { name, category, language, components } = await req.json();
    if (!name || !category || !language || !components)
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });

    if (!/^[a-z0-9_]+$/.test(name))
      return NextResponse.json(
        { success: false, message: "Template name must be lowercase alphanumeric with underscores" },
        { status: 400 }
      );

    // ✅ Call WhatsApp Cloud API to create template
    const fbUrl = `https://graph.facebook.com/v23.0/${waba_id}/message_templates`;
    const fbPayload = {
      name,
      language,
      category,
      components, // text, buttons, etc. as per WA template API
    };
    const fbHeaders = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    let fbResponse;
    try {
      fbResponse = await axios.post(fbUrl, fbPayload, { headers: fbHeaders });
    } catch (fbError: any) {
      const fbErrorData = fbError?.response?.data
          ? JSON.stringify(fbError.response.data, null, 2)
          : fbError.message;
      return NextResponse.json({
        success: false,
        message: `Facebook API error: ${fbErrorData}`,
      }, { status: 400 });
    }

    // ✅ Save in DB
    const newTemplate = await Template.create({
      userId: user._id,
      waAccountId: wa._id,
      name,
      category,
      language,
      components,
      fbTemplateId: fbResponse.data.id, // Save FB template ID
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: "Template created and verified with Facebook", data: newTemplate },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Error: ${error?.message || "Something went wrong"}` },
      { status: 500 }
    );
  }
}
