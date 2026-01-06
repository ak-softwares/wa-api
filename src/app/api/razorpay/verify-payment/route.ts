import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';
import { ApiResponse } from '@/types/apiResponse';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const body = await req.json();
    const razorpay_signature = body.razorpay_signature;
    
    // Generate signature for verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.razorpay_order_id + '|' + body.razorpay_payment_id)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is authentic
      // HERE: You can trigger your WA-API.me webhook to send a WhatsApp confirmation
      // Example: await fetch('your-wa-api-webhook-url', { method: 'POST', body: ... });

      const response: ApiResponse = {
        success: true,
        message: 'Payment verified successfully',
      };
      return NextResponse.json(response, { status: 200 });
    } else {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid signature',
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Verification failed',
    };
    return NextResponse.json(response, { status: 500 });
  }
}