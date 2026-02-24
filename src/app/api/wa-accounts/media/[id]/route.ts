import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { WhatsAppClient } from "@/services/whatsappApi/WhatsAppClient";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    
  const { user, waAccount, errorResponse } = await getDefaultWaAccount();
  if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
  
  const { id: mediaId } = await params;

  try {
    const whatsapp = new WhatsAppClient({
      phone_number_id: waAccount.phone_number_id,
      permanent_token: waAccount.permanent_token,
    });
    const { buffer, contentType } = await whatsapp.media.download(mediaId);

    // STEP 3 → Return the media file itself
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });

  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Error fetching media: " + (error instanceof Error ? error.message : String(error)),
    };
    return NextResponse.json(response, { status: 500 });
  }
}
