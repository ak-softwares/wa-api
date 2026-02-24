import { NextRequest, NextResponse } from "next/server";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { WhatsAppClient } from "@/services/whatsappApi/WhatsAppClient";

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

    const whatsapp = new WhatsAppClient({
      phone_number_id: waAccount.phone_number_id,
      permanent_token: waAccount.permanent_token,
    });

    const mediaId = await whatsapp.media.upload(file);

    const response: ApiResponse = {
      success: true,
      message: "Media uploaded successfully",
      data: {
        mediaId: mediaId,
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
