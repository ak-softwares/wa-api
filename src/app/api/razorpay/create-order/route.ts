import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';
import { CreatedOrderResponse, RazorpayCreateOrderRequest } from '@/types/Razorpay';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { ApiResponse } from '@/types/apiResponse';

// Initialize Razorpay with your keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { amount, currency } = await req.json();

    const options: RazorpayCreateOrderRequest = {
      amount: amount * 100, // Razorpay expects amount in paise (₹1 = 100 paise)
      currency: currency || 'USD',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    // const orderAmount = Math.round((Number(order.amount) / 100) * 10) / 10;
    const orderAmount = Number(order.amount);

    const response: ApiResponse<CreatedOrderResponse> = {
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        currency: order.currency,
        amount: orderAmount,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      },
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      message: 'Failed to create order',
    };

    return NextResponse.json(response, { status: 500 });
  }
}