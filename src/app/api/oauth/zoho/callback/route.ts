import { NextRequest, NextResponse } from "next/server";

const ZOHO_TOKEN_URL = "https://accounts.zoho.in/oauth/v2/token";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(ZOHO_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.ZOHO_CLIENT_ID!,
        client_secret: process.env.ZOHO_CLIENT_SECRET!,
        redirect_uri: process.env.ZOHO_REDIRECT_URI!,
        code,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tokens", details: data },
        { status: 500 }
      );
    }

    // ⚠️ IMPORTANT: Save refresh_token securely (DB or env)
    // console.log("Zoho Tokens:", data);

    return NextResponse.json({
      message: "Zoho connected successfully",
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal error", details: error.message },
      { status: 500 }
    );
  }
}