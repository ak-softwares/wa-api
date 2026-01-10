import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';
import { ApiResponse } from '@/types/apiResponse';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { PaymentStatus } from '@/types/WalletTransaction';
import { WalletModel } from '@/models/Wallet';

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const body = await req.json();
    const razorpay_signature = body.razorpay_signature;
    const razorpay_order_id = body.razorpay_order_id;
    const razorpay_payment_id = body.razorpay_payment_id;
    
    // Generate signature for verification
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid signature',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Find the transaction using order ID
    const transaction = await WalletTransactionModel.findOneAndUpdate(
      {
        userId: user._id,
        orderId: razorpay_order_id,
        paymentStatus: PaymentStatus.PENDING,
      },
      {
        $set: {
          paymentStatus: PaymentStatus.PROCESSING,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!transaction) {
      const response: ApiResponse = {
        success: true, // 👈 IMPORTANT: not an error
        message: 'Transaction already handled',
      };
      return NextResponse.json(response, { status: 200 });
    }


    // Find user's wallet
    let wallet = await WalletModel.findOne({ userId: user._id });
    if (!wallet) {
      // Create wallet if doesn't exist (should exist from order creation, but just in case)
      wallet = await WalletModel.create({
        userId: user._id,
        balance: 0,
        locked: 0,
      });
    }

    // // Update wallet balance only if payment is successful
    // if (transaction.type === WalletTransactionType.CREDIT) {
    //   await WalletModel.findOneAndUpdate(
    //     { userId: user._id },
    //     {
    //       $inc: { balance: transaction.credits },
    //       updatedAt: new Date()
    //     },
    //     { new: true }
    //   );
    // }

    // HERE: You can trigger your webhook to send a WhatsApp confirmation

    const response: ApiResponse = {
      success: true,
      message: 'Payment verified and wallet updated successfully',
      data: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        creditsAdded: transaction.credits,
        newBalance: wallet.balance + transaction.credits
      }
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Verification failed',
    };
    return NextResponse.json(response, { status: 500 });
  }
}