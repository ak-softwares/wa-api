import { SubscriptionUsageModel } from '@/models/SubscriptionUses';
import { SubscriptionModel } from '@/models/Subscription';
import mongoose from 'mongoose';
import { PLAN_CONFIG } from '@/config/plans';
import dayjs from 'dayjs';

function getMessageLimit(tier: string): number {
  return PLAN_CONFIG[tier as keyof typeof PLAN_CONFIG]?.messagesPerMonth ?? 100;
}

// ── Shared: find active usage record or build one from subscription ──────────

async function resolveUsageRecord( userId: mongoose.Types.ObjectId ) {
  const now = new Date();

  // 1. Active usage period already exists → return it
  const existing = await SubscriptionUsageModel.findOne({ 
    userId, periodStart: { $lte: now }, periodEnd: { $gte: now } 
  });
  if (existing) return existing;

  // 2. No usage record — check for an active subscription
  const subscription = await SubscriptionModel.findOne({ userId, status: 'active' });

  if (subscription) {
    // Subscription exists but usage record is missing (e.g. first message of new period)
    // Build usage period from subscription's current billing window
    const periodStart = subscription.currentStart ?? now;
    const periodEnd   = subscription.currentEnd   ?? dayjs(periodStart).add(1, 'month').toDate();
    const messageLimit = getMessageLimit(subscription.tier);

    return SubscriptionUsageModel.findOneAndUpdate(
      { userId, periodStart, periodEnd },
      {
        $setOnInsert: {
          userId,
          tier: subscription.tier,
          periodStart,
          periodEnd,
          messagesUsed: 0,
          messageLimit,
        },
      },
      { upsert: true, new: true },
    );
  }

  // 3. No subscription at all → auto-assign FREE plan for this month
  const periodStart = now;
  const periodEnd   = dayjs(now).add(1, 'month').toDate();
  const messageLimit = getMessageLimit('FREE');

  // Upsert the subscription record
  await SubscriptionModel.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        tier:    'FREE',
        billing: 'MONTHLY',
        status:  'active',
        currentStart: periodStart,
        currentEnd:   periodEnd,
      },
    },
    { upsert: true, new: true },
  );

  // Upsert the usage period
  return SubscriptionUsageModel.findOneAndUpdate(
    { userId, periodStart, periodEnd },
    {
      $setOnInsert: {
        userId,
        tier: 'FREE',
        periodStart,
        periodEnd,
        messagesUsed: 0,
        messageLimit,
      },
    },
    { upsert: true, new: true },
  );
}

import { SubscriptionStatus } from '@/models/Subscription';

// ── Check quota + subscription status before sending a message ───────────────

export async function canSendMessage(
  userId: mongoose.Types.ObjectId,
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {

  // 1. Check subscription is active
  const subscription = await SubscriptionModel.findOne({ userId });

  if (!subscription) {
    return { allowed: false, remaining: 0, reason: 'No subscription found' };
  }

  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    return {
      allowed:   false,
      remaining: 0,
      reason:    `Subscription is ${subscription.status}`,  // e.g. "halted", "cancelled"
    };
  }

  // 2. Check quota
  const record = await resolveUsageRecord(userId);
  if (!record) return { allowed: false, remaining: 0, reason: 'No usage period found' };

  const plan = PLAN_CONFIG[record.tier as keyof typeof PLAN_CONFIG];
  if (!plan) return { allowed: false, remaining: 0, reason: 'Invalid plan' };

  // Unlimited plan
  if (plan.messagesPerMonth < 0) return { allowed: true, remaining: -1 };

  const remaining = plan.messagesPerMonth - record.messagesUsed;
  return {
    allowed:   remaining > 0,
    remaining: Math.max(0, remaining),
    reason:    remaining <= 0 ? 'Message quota exceeded' : undefined,
  };
}

interface IncrementMessageUsageParams {
  userId: mongoose.Types.ObjectId;
  session?: mongoose.ClientSession;
}

// ── 2. Atomically consume one credit (only call after isMessageCreditAvailable) ──
export async function incrementMessageUsage({userId, session}: IncrementMessageUsageParams): Promise<{ success: boolean; remaining: number }> {
  const record = await resolveUsageRecord(userId);

  if (!record) return { success: false, remaining: 0 };

  const plan = PLAN_CONFIG[record.tier as keyof typeof PLAN_CONFIG];
  if (!plan) return { success: false, remaining: 0 };

  // Atomic increment — condition prevents overshooting the limit
  const updated = await SubscriptionUsageModel.findOneAndUpdate(
    { _id: record._id, messagesUsed: { $lt: plan.messagesPerMonth } },
    { $inc: { messagesUsed: 1 } },
    { new: true, session },
  );

  if (!updated) return { success: false, remaining: 0 };

  return {
    success:   true,
    remaining: plan.messagesPerMonth - updated.messagesUsed,
  };
}

// ── Read current usage ────────────────────────────────────────────────────────

export async function getCurrentUsage(userId: mongoose.Types.ObjectId) {
  const now = new Date();
  return SubscriptionUsageModel.findOne({
    userId,
    periodStart: { $lte: now },
    periodEnd:   { $gte: now },
  });
}