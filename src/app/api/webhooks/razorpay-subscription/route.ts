import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { PaymentHistoryModel } from '@/models/PaymentHistory';
import { SubscriptionModel, SubscriptionStatus } from '@/models/Subscription';
import { PaymentStatus, RazorpayWebhookEvent } from '@/types/PaymentHistory';
import { resolvePaymentHistory, upsertSubscription } from '@/services/razorpay/subscriptionHelpers';

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const razorpaySignature = req.headers.get('x-razorpay-signature');

    if (!webhookSecret) {
      return NextResponse.json(
        { success: false, message: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!razorpaySignature) {
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    const body = await req.text();
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
    const event = payload.event as RazorpayWebhookEvent;
    const subscription = payload.payload?.subscription?.entity;
    console.log(`Received Razorpay webhook: ${event} for subscription ${subscription?.id}`);
    if (!subscription?.id) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const subscriptionId = subscription.id as string;

    // ── 3. Handle events ─────────────────────────────────────────────────
    switch (event) {

      // ✅ First event after user authenticates card (before payment)
      case 'subscription.authenticated': {
        await PaymentHistoryModel.findOneAndUpdate(
          { subscriptionId, status: PaymentStatus.PENDING },
          { $set: { status: PaymentStatus.AUTHENTICATED } }
        );
        break;
      }

      // ✅ First payment succeeded — CREATE subscription in DB (upsert)
      case 'subscription.activated': {
        await upsertSubscription({ subscription, status: SubscriptionStatus.ACTIVE });
        await resolvePaymentHistory({ subscriptionId, status: PaymentStatus.PAID });
        break;
      }

      // ✅ Recurring charge (2nd payment onwards)
      case 'subscription.charged': {
        await upsertSubscription({ subscription, status: SubscriptionStatus.ACTIVE });
        await resolvePaymentHistory({ subscriptionId, status: PaymentStatus.PAID });
        break;
      }

      case 'subscription.pending': {
        await PaymentHistoryModel.findOneAndUpdate(
          { subscriptionId, status: PaymentStatus.AUTHENTICATED },
          { $set: { status: PaymentStatus.PENDING } }
        );
        break;
      }

      case 'subscription.halted': {
        await SubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.HALTED } }
        );
        break;
      }

      case 'subscription.cancelled': {
        await SubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.CANCELLED } }
        );
        break;
      }

      case 'subscription.completed': {
        await SubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.COMPLETED } }
        );
        break;
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
