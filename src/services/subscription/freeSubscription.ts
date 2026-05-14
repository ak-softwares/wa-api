import { Types } from "mongoose";

import { SubscriptionStatus, SubscriptionModel } from "@/models/Subscription";

const FREE_SUBSCRIPTION_PLAN_ID = "free";

export function getFreeSubscriptionId(userId: Types.ObjectId) {
  return `free_${userId.toString()}`;
}

const PAID_SUBSCRIPTION_TIERS = ["STARTER", "GROWTH"] as const;

export async function createOrActivateFreeSubscription(userId: Types.ObjectId) {
  
  const existingPaidSubscription = await SubscriptionModel.exists({
    userId,
    tier: { $in: PAID_SUBSCRIPTION_TIERS },
  });

  if (existingPaidSubscription) {
    return null;
  }

  const now = new Date();
  const subscriptionId = getFreeSubscriptionId(userId);

  return SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        status: SubscriptionStatus.ACTIVE,
      },
      $setOnInsert: {
        userId,
        subscriptionId,
        planId: FREE_SUBSCRIPTION_PLAN_ID,
        tier: "FREE",
        billing: "MONTHLY",
        currency: "INR",
        currentStart: now,
        totalCount: 0,
        paidCount: 0,
        remainingCount: 0,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}
