import { NextRequest, NextResponse } from "next/server";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse;

    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!(file instanceof File)) {
      const response: ApiResponse = {
        success: false,
        message: "Media file is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const uploadForm  = new FormData();
    uploadForm.append("messaging_product", "whatsapp");
    uploadForm.append("file", file, file.name);

    const uploadUrl = `https://graph.facebook.com/v24.0/${waAccount.phone_number_id}/media`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waAccount.permanent_token}`,
      },
      body: uploadForm,
    });

    const data = await uploadResponse.json();

    if (!uploadResponse.ok || !data?.id) {
      const message = data?.error?.error_user_msg || data?.error?.message || "Upload failed";
      const response: ApiResponse = {
        success: false,
        message: message,
      };
      return NextResponse.json(response, { status:  uploadResponse.status || 500 });
    }

    const response: ApiResponse = {
      success: true,
      message: "Media uploaded successfully",
      data: {
        mediaId: data.id,
      },
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err?.message || "Upload failed",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
