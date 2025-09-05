// app/api/facebook/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("http://localhost:3000/dashboard?error=no_code");
  }

  // Redirect with the code so your dashboard/WhatsAppSignup can pick it up
  return NextResponse.redirect(`http://localhost:3000/dashboard?code=${code}`);
}
