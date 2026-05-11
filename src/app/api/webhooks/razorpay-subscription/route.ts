import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { SubscriptionPaymentHistoryModel } from '@/models/SubscriptionPaymentHistory';
import { UserSubscriptionModel, SubscriptionStatus } from '@/models/Subscription';
import { SubscriptionPaymentStatus } from '@/types/SubscriptionPaymentHistory';

const toDate = (unix?: number) => (unix ? new Date(unix * 1000) : undefined);

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
    const event = payload.event as string;
    console.log(`Received Razorpay webhook event: ${event}`);
    const subscription = payload.payload?.subscription?.entity;

    if (!subscription?.id) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const subscriptionId = subscription.id as string;

    switch (event) {
      case 'subscription.authenticated':
        await UserSubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.AUTHENTICATED } }
        );
        break;

      case 'subscription.activated':
        await UserSubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          {
            $set: {
              status: SubscriptionStatus.ACTIVE,
              currentStart: toDate(subscription.current_start),
              currentEnd: toDate(subscription.current_end),
            },
          }
        );
        break;

      case 'subscription.charged': {
        const userSubscription = await UserSubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          {
            $set: {
              status: SubscriptionStatus.ACTIVE,
              paidCount: subscription.paid_count ?? 0,
              remainingCount: subscription.remaining_count ?? 0,
              currentStart: toDate(subscription.current_start),
              currentEnd: toDate(subscription.current_end),
            },
          },
          { new: true }
        );

        if (userSubscription) {
          await SubscriptionPaymentHistoryModel.create({
            userId: userSubscription.userId,
            subscriptionId: userSubscription.subscriptionId,
            planId: userSubscription.planId,
            tier: userSubscription.tier,
            billing: userSubscription.billing,
            currency: userSubscription.currency,
            totalCount: userSubscription.totalCount,
            quantity: 1,
            status: SubscriptionPaymentStatus.PAID,
            shortUrl: userSubscription.shortUrl,
          });
        }
        break;
      }

      case 'subscription.halted':
        await UserSubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.HALTED } }
        );
        break;

      case 'subscription.cancelled':
        await UserSubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.CANCELLED } }
        );
        break;

      case 'subscription.completed':
        await UserSubscriptionModel.findOneAndUpdate(
          { subscriptionId },
          { $set: { status: SubscriptionStatus.COMPLETED } }
        );
        break;

      case 'payment.failed': {
        const userSubscription = await UserSubscriptionModel.findOne({ subscriptionId });

        if (userSubscription) {
          await SubscriptionPaymentHistoryModel.create({
            userId: userSubscription.userId,
            subscriptionId: userSubscription.subscriptionId,
            planId: userSubscription.planId,
            tier: userSubscription.tier,
            billing: userSubscription.billing,
            currency: userSubscription.currency,
            totalCount: userSubscription.totalCount,
            quantity: 1,
            status: SubscriptionPaymentStatus.FAILED,
            shortUrl: userSubscription.shortUrl,
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Razorpay Subscription Webhook Error:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
