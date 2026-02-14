import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { GoogleService } from "@/types/OAuth";

const scopeMap: Record<GoogleService, string[]> = {
  google_contacts_import: ["https://www.googleapis.com/auth/contacts.readonly"],
  google_contacts: ["https://www.googleapis.com/auth/contacts"],
  google_calendar: ["https://www.googleapis.com/auth/calendar"],
  google_sheets: ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive.file"],
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tool = searchParams.get("tool") as GoogleService;

    // ✅ validate tool
    if (!tool || !scopeMap[tool]) {
      const response: ApiResponse = { success: false,  message: "Invalid or missing service. Use contacts or calendar" };
      return NextResponse.json(response, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: scopeMap[tool],
      state: tool,
    });

    const response: ApiResponse = { 
      success: true,
      message: "Google OAuth URL generated successfully",
      data: url,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = { success: false,  message: err.message || "Failed to generate Google OAuth URL" };
    return NextResponse.json(response, { status: 500 });
  }
}
