import { PaymentHistoryModel } from "@/models/PaymentHistory";
import { SubscriptionModel, SubscriptionStatus } from "@/models/Subscription";
import { PaymentStatus } from "@/types/PaymentHistory";

const toDate = (unix?: number) => (unix ? new Date(unix * 1000) : undefined);

interface CreatedSubscriptionParams {
  subscription: any;
  status: SubscriptionStatus;
}

export async function upsertSubscription({ subscription, status }: CreatedSubscriptionParams) {
  const notes = subscription.notes ?? {};
  const { userId, tier, billing, currency } = notes;

  if (!userId) {
    console.error(`❌ Missing userId in notes for subscription: ${subscription.id}`);
    return null;
  }

  return SubscriptionModel.findOneAndUpdate(
    { userId },                               // one active sub per user
    {
      $set: {
        userId,
        subscriptionId:  subscription.id,
        planId:          subscription.plan_id,
        tier,
        billing,
        currency,
        status,
        totalCount:      subscription.total_count,
        paidCount:       subscription.paid_count      ?? 0,
        remainingCount:  subscription.remaining_count ?? 0,
        shortUrl:        subscription.short_url,
        currentStart:    toDate(subscription.current_start),
        currentEnd:      toDate(subscription.current_end),
      },
    },
    { upsert: true, new: true }
  );
}

interface PaymentHistoryParams {
  subscriptionId: string;
  status: PaymentStatus;
}

export async function resolvePaymentHistory({subscriptionId, status}: PaymentHistoryParams) {
  await PaymentHistoryModel.findOneAndUpdate(
    {
      subscriptionId,
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.AUTHENTICATED] },
    },
    { $set: { status, paidAt: status === PaymentStatus.PAID ? new Date() : undefined } }
  );
}