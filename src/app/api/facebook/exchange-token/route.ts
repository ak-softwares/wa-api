// Backend API route with improved redirect_uri handling
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/apiResponse';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      const response: ApiResponse = {
        success: false,
        message: 'Missing authorization code',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Build params
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      redirect_uri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI!,
      code,
      grant_type: 'authorization_code',
    });

    // Correct POST request with x-www-form-urlencoded body
    const fbRes = await fetch('https://graph.facebook.com/v22.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await fbRes.json();

    if (!fbRes.ok) {
      console.error('Facebook API error:', data);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to exchange token',
        error: data.error || { message: 'Unknown error' },
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Token exchange successful',
      data,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    console.error('Unexpected error in token exchange:', err);
    const response: ApiResponse = {
      success: false,
      message: err.message || 'Unexpected error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}