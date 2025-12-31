import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { TemplateModel } from "@/models/Template";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

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
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { waba_id, permanent_token } = waAccount;

    // Parse request
    const { name, category, language, components } = await req.json();
    // console.log("Received template creation request:", JSON.stringify({ components }));
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
        const fbErrData = fbError?.response?.data;
        const fbErr = fbErrData?.error ?? fbErrData; // sometimes shape differs

        // Prefer the 'error_user_msg' field if present, otherwise fall back to a safe message
        const userMessage =
          (typeof fbErr?.error_user_msg === "string" && fbErr.error_user_msg) ||
          (typeof fbErr?.message === "string" && fbErr.message) ||
          (typeof fbError?.message === "string" && fbError.message) ||
          "Something went wrong with Facebook API";

        return NextResponse.json({
          success: false,
          message: userMessage,
        }, { status: 400 });
    }

    // ✅ Save in DB
    const newTemplate = await TemplateModel.create({
      id: fbResponse.data.id, // Save FB template ID
      userId: user._id,
      waAccountId: waAccount._id,
      name,
      category: fbResponse.data.category || category,
      language,
      components,
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

export async function PUT(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { permanent_token } = waAccount;

    // Parse request
    const { id, name, category, language, components } = await req.json();
    if (!id)
      return NextResponse.json(
        { success: false, message: "Template ID (local DB ID) is required" },
        { status: 400 }
      );

    if (!name || !category || !language || !components)
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );

    if (!/^[a-z0-9_]+$/.test(name))
      return NextResponse.json(
        { success: false, message: "Template name must be lowercase alphanumeric with underscores" },
        { status: 400 }
      );

    // ✅ Call WhatsApp Cloud API to create template
    const fbUrl = `https://graph.facebook.com/v23.0/${id}`;
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
        const fbErrData = fbError?.response?.data;
        const fbErr = fbErrData?.error ?? fbErrData; // sometimes shape differs

        // Prefer the 'error_user_msg' field if present, otherwise fall back to a safe message
        const userMessage =
          (typeof fbErr?.error_user_msg === "string" && fbErr.error_user_msg) ||
          (typeof fbErr?.message === "string" && fbErr.message) ||
          (typeof fbError?.message === "string" && fbError.message) ||
          "Something went wrong with Facebook API";

        return NextResponse.json({
          success: false,
          message: userMessage,
        }, { status: 400 });
    }

    // Update DB template
    const updatedTemplate = await TemplateModel.findOneAndUpdate(
      {
        id: id,
        userId: user._id,
        // waAccountId: waAccount._id,
      },
      {
        name,
        category,
        language,
        components,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedTemplate) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Template updated successfully",
        data: updatedTemplate,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: `Error: ${error?.message || "Something went wrong"}` },
      { status: 500 }
    );
  }
}