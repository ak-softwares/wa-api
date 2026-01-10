import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';
import { CreatedOrderResponse, RazorpayCreateOrderRequest } from '@/types/Razorpay';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { ApiResponse } from '@/types/apiResponse';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { PaymentStatus, WalletTransaction, WalletTransactionType } from '@/types/WalletTransaction';
import { amountToCredits } from '@/lib/wallet/pricing';
import { WalletModel } from '@/models/Wallet';

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
    if (typeof amount !== "number" || amount <= 0 || !currency) {
      const response: ApiResponse = {
        success: false,
        message: "Amount and currency are required",
      };

      return NextResponse.json(response, { status: 400 });
    }
    
    const credits = amountToCredits({ amount, currency });

    const options: RazorpayCreateOrderRequest = {
      amount: amount * 100, // Razorpay expects amount in paise (₹1 = 100 paise)
      currency: currency || 'USD',
      receipt: `receipt_${Date.now()}`,
      notes: {
        credits: credits.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    // const orderAmount = Math.round((Number(order.amount) / 100) * 10) / 10;
    const orderAmount = Math.round((Number(order.amount) / 100) * 10) / 10;

    // Find user's wallet
    let wallet = await WalletModel.findOne({ userId: user._id });
    
    if (!wallet) {
      // Create wallet if doesn't exist
      wallet = await WalletModel.create({
        userId: user._id,
        balance: 0,
        locked: 0,
      });
    }
    
    // Update wallet balance
    const creditsBefore = wallet.balance;
    const creditsAfter = creditsBefore + credits;
      
    const WalletTransaction: WalletTransaction = {
      userId: user._id,
      type: WalletTransactionType.CREDIT,
      currency: order.currency,
      amount: orderAmount,
      credits: credits,
      creditsBefore,
      creditsAfter,
      orderId: order.id,
      paymentStatus: PaymentStatus.PENDING
    }

    // Create transaction record
    await WalletTransactionModel.create(WalletTransaction);

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

  } catch (error: any) {
    // console.error("❌ Razorpay order creation failed:", {
    //   message: error?.message,
    //   stack: error?.stack,
    //   razorpay: error?.error,
    // });

    // Razorpay specific error
    if (error?.error?.description) {
      const response: ApiResponse = {
        success: false,
        message: error.error.description,
      };

      return NextResponse.json(response, { status: 502 });
    }

    // Fallback error
    const response: ApiResponse = {
      success: false,
      message: 'Unable to create order at the moment. Please try again.',
    };

    return NextResponse.json(response, { status: 500 });
  }
}