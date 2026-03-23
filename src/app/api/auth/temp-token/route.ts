import { NextRequest, NextResponse } from "next/server";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { generateTempAccessToken } from "@/services/auth/tempAccessToken";
import { ApiResponse } from "@/types/apiResponse";
import { SETUP_PATH } from "@/utiles/auth/auth";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { token, expiresAt, ttlMinutes } = await generateTempAccessToken(
      user._id.toString()
    );

    const response: ApiResponse = {
      success: true,
      message: "Setup access token generated",
      data: {
        token,
        expiresAt,
        ttlMinutes,
        headerName: "x-setup-token",
        setupUrl: SETUP_PATH,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to generate setup access token" },
      { status: 500 }
    );
  }
}
