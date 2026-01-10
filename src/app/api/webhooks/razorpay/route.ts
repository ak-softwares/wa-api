import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { WalletTransactionModel } from '@/models/WalletTransaction';
import { WalletModel } from '@/models/Wallet';
import { PaymentStatus, WalletTransactionType } from '@/types/WalletTransaction';
import { ApiResponse } from '@/types/apiResponse';

// https://wa-api.me/api/webhooks/razorpay
// Razorpay sends RAW body → DO NOT use req.json()
export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const razorpaySignature = req.headers.get('x-razorpay-signature');

    if (!razorpaySignature) {
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    // 🔒 Read raw body
    // const bodyBuffer = Buffer.from(await req.arrayBuffer());
    // const body = bodyBuffer.toString();
    const body = await req.text();
    // console.log(body);
    // 🔐 Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(body);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;

    // ✅ Handle only successful payments
    if (event == 'payment.failed') {
        // Find the transaction using order ID
        const transaction = await WalletTransactionModel.findOneAndUpdate(
        {
            orderId,
            paymentStatus: PaymentStatus.PENDING,
        },
        {
            $set: {
                paymentId,
                paymentStatus: PaymentStatus.FAILED,
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
    }
    if (event !== 'payment.captured') {
      return NextResponse.json({ success: true });
    }

    // Find the transaction using order ID
    const transaction = await WalletTransactionModel.findOneAndUpdate(
      {
        orderId,
        paymentStatus: { $in: [PaymentStatus.PENDING, PaymentStatus.FAILED] },
      },
      {
        $set: {
            paymentId,
            paymentStatus: PaymentStatus.SUCCESS,
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
    
    // 🏦 Fetch or create wallet
    let wallet = await WalletModel.findOne({ userId: transaction.userId });
    if (!wallet) {
      wallet = await WalletModel.create({
        userId: transaction.userId,
        balance: 0,
        locked: 0,
      });
    }

    // 💰 Credit wallet
    if (transaction.type === WalletTransactionType.CREDIT) {
      await WalletModel.findOneAndUpdate(
        { userId: transaction.userId },
        {
          $inc: { balance: transaction.credits },
          updatedAt: new Date(),
        }
      );
    }

    // 📲 Trigger WhatsApp / email notification here if needed

    const response: ApiResponse = {
      success: true,
      message: 'Webhook processed successfully',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}


//{"entity":"event","account_id":"acc_Rtp2kd44MMiETg","event":"payment.captured","contains":["payment"],"payload":{"payment":{"entity":{"id":"pay_S1hatPnKSKLoTg","entity":"payment","amount":2000,"currency":"INR","status":"captured","order_id":"order_S1hYcAZ4wd0LdR","invoice_id":null,"international":false,"method":"upi","amount_refunded":0,"refund_status":null,"captured":true,"description":"Subscription upgrade","card_id":null,"bank":null,"wallet":null,"vpa":"success@razorpay","email":"aramarket.in@gmail.com","contact":"+919368994493","notes":{"credits":"120"},"fee":48,"tax":8,"error_code":null,"error_description":null,"error_source":null,"error_step":null,"error_reason":null,"acquirer_data":{"rrn":"789509733411","upi_transaction_id":"BC405BCD55F3CB7DFE301FAF593802B6"},"created_at":1767944688,"reward":null,"upi":{"vpa":"success@razorpay","flow":"collect"},"base_amount":2000}}},"created_at":1767944690}
//{"entity":"event","account_id":"acc_Rtp2kd44MMiETg","event":"payment.failed","contains":["payment"],"payload":{"payment":{"entity":{"id":"pay_S1izmG29kkRLWp","entity":"payment","amount":1000,"currency":"INR","status":"failed","order_id":"order_S1ip8hIHqsJGO3","invoice_id":null,"international":false,"method":"card","amount_refunded":0,"refund_status":null,"captured":false,"description":"Subscription upgrade","card_id":"card_S1izmSotNGBJg7","card":{"id":"card_S1izmSotNGBJg7","entity":"card","name":"","last4":"5449","network":"MasterCard","type":"credit","issuer":"UTIB","international":false,"emi":false,"sub_type":"consumer","token_iin":"526731818"},"bank":null,"wallet":null,"vpa":null,"email":"aramarket.in@gmail.com","contact":"+919368994493","notes":{"credits":"60"},"fee":null,"tax":null,"error_code":"BAD_REQUEST_ERROR","error_description":"Payment failed","error_source":"gateway","error_step":"payment_authorization","error_reason":"payment_failed","acquirer_data":{"auth_code":null},"created_at":1767949624,"reward":null}}},"created_at":1767949629}