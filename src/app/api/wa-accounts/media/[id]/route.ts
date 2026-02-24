import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    
  const { user, waAccount, errorResponse } = await getDefaultWaAccount();
  if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
  
  const { permanent_token } = waAccount;
  const { id: mediaId } = await params;

  try {

    // STEP 1 → GET media URL
    const metaRes = await fetch(
      `https://graph.facebook.com/v24.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${permanent_token}`,
        },
      }
    );

    const meta = await metaRes.json();

    if (!meta.url) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to retrieve media URL",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // STEP 2 → Fetch actual media using auth header
    const mediaRes = await fetch(meta.url, {
      headers: {
        Authorization: `Bearer ${permanent_token}`,
      },
    });

    if (!mediaRes.ok) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to download media",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const arrayBuffer = await mediaRes.arrayBuffer();
    const contentType = mediaRes.headers.get("Content-Type") || "application/octet-stream";

    // STEP 3 → Return the media file itself
    return new NextResponse(arrayBuffer, {
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
