import { NextRequest, NextResponse } from "next/server";

import { PLAN_CONFIG } from "@/config";
import { IMonthlyUsage, MonthlyUsageModel } from "@/models/MonthlyUsage";
import {
  ISubscription,
  SubscriptionStatus,
  SubscriptionModel,
} from "@/models/Subscription";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { PlanTier } from "@/types/Plans";
import { SubscriptionUsageResponse } from "@/types/SubscriptionUsage";
import { getCurrentUsage } from "@/services/subscription/usageService";

const LIVE_SUBSCRIPTION_STATUSES = [
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.AUTHENTICATED,
];

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const subscription = await SubscriptionModel.findOne({
        userId: user._id,
        status: { $in: LIVE_SUBSCRIPTION_STATUSES },
      })
        .sort({ currentEnd: -1, updatedAt: -1 })
        .lean<ISubscription>();

    const usage = await getCurrentUsage(user._id);

    const tier = (subscription?.tier ?? "FREE") as PlanTier;
    const plan = PLAN_CONFIG[tier];
    const messageLimit = plan.messagesPerMonth;
    const usedMessages = usage?.messagesUsed ?? 0;
    const remainingMessages = Math.max(messageLimit - usedMessages, 0);
    const usagePercent = messageLimit <= 0
      ? 0
      : Math.min(Math.round((usedMessages / messageLimit) * 100), 100);

    const data: SubscriptionUsageResponse = {
      tier,
      planName: plan.name,
      status: subscription?.status ?? "free",
      billing: subscription?.billing ?? null,
      currency: subscription?.currency ?? null,
      subscriptionId: subscription?.subscriptionId ?? null,
      renewsAt: subscription?.currentEnd?.toISOString() ?? null,
      currentPeriodStart: subscription?.currentStart?.toISOString() ?? null,
      messageLimit,
      usedMessages,
      remainingMessages,
      usagePercent,
      year,
      month,
    };

    const response: ApiResponse<SubscriptionUsageResponse> = {
      success: true,
      message: "Subscription usage fetched successfully",
      data,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message || "Internal Server Error",
    };

    return NextResponse.json(response, { status: 500 });
  }
}
