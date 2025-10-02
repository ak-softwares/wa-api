import { google } from "googleapis";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";

export async function GET() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/contacts.readonly"],
    });

    const response: ApiResponse & { url?: string } = {
      success: true,
      message: "Google OAuth URL generated successfully",
      url,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || "Failed to generate Google OAuth URL",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
