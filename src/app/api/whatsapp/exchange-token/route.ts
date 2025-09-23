// Backend API route with improved redirect_uri handling
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/apiResponse';
import { connectDB } from '@/lib/mongoose';
import { User } from '@/models/User';
import { IWaAccount } from '@/models/WaAccount';

export async function POST(req: Request) {
  try {
    const { userEmail, phone_number_id, waba_id, business_id, access_token } = await req.json();
    
    if (!userEmail || !phone_number_id || !waba_id || !business_id || !access_token) {
      const response: ApiResponse = {
        success: false,
        message: 'Missing required fields',
      };
      return NextResponse.json(response, { status: 400 });
    }
    // Build params
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      // redirect_uri: process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI!,
      code: access_token,
      grant_type: 'authorization_code',
    });

    // Correct POST request with x-www-form-urlencoded body
    const fbRes = await fetch('https://graph.facebook.com/v23.0/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await fbRes.json();
    if (!fbRes.ok) {
      const response: ApiResponse = {
        success: false,
        message: data.error.message || { message: 'Unknown error' },
      };
      return NextResponse.json(response, { status: 500 });
    }

    
    const permanent_token = data.access_token;

    // Connect to DB
    await connectDB();

    // Save WA account to user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Create WA account object
    const waAccount: IWaAccount = {
      phone_number_id,
      waba_id,
      business_id,
      permanent_token,
    };

    // Save or update user's WA accounts
    user.waAccounts = waAccount;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: "Token exchanged and WA account saved successfully",
    };

    return NextResponse.json(response, { status: 200 });

  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err.message || 'Unexpected error',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
