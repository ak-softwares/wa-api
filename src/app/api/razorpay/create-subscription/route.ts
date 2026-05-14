import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';
import { CreatedSubscriptionResponse, RazorpayCreateSubscriptionRequest } from '@/types/Razorpay-web';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { ApiResponse } from '@/types/apiResponse';
import { PaymentHistoryModel } from '@/models/PaymentHistory';
import { PaymentStatus } from '@/types/PaymentHistory';
import { BILLING_CYCLES, CURRENCIES, BillingCycle, Currency, PlanTier } from '@/types/Plans';
import { createOrActivateFreeSubscription } from '@/services/subscription/freeSubscription';
 
/** Maps (tier, billing, currency) → Razorpay plan ID from env */
function resolvePlanId(tier: PlanTier, billing: BillingCycle, currency: Currency): string {
  const key = `RZP_PLAN_${tier}_${billing}_${currency}`;
  const planId = process.env[key];
  if (!planId) throw new Error(`Plan not found for key: ${key}`);
  return planId;
}
 
/** How many billing cycles to authorise up front (Razorpay `total_count`) */
const TOTAL_COUNT: Record<BillingCycle, number> = {
  MONTHLY: 36,
  YEARLY:  3,
};

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // ── Validate body ──────────────────────────────────────────────────────
    const body = await req.json();
    const { tier, billing, currency } = body as {
      tier:     PlanTier;
      billing:  BillingCycle;
      currency: Currency;
    };
 
    const validTiers = ['FREE', 'STARTER', 'GROWTH'] as const satisfies readonly PlanTier[];
 
    if (
      !(validTiers     as readonly string[]).includes(tier)     ||
      !(BILLING_CYCLES as readonly string[]).includes(billing)  ||
      !(CURRENCIES     as readonly string[]).includes(currency)
    ) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid plan configuration. tier, billing, and currency are required.',
      };
      return NextResponse.json(response, { status: 400 });
    }
 
    if (tier === 'FREE') {
      const freeSubscription = await createOrActivateFreeSubscription(user._id);

      const response: ApiResponse<CreatedSubscriptionResponse> = {
        success: true,
        message: 'Free subscription activated successfully',
        data: {
          id: freeSubscription.subscriptionId,
          plan_id: freeSubscription.planId,
          status: freeSubscription.status,
          short_url: null,
          currency: freeSubscription.currency,
          tier: freeSubscription.tier,
          billing: freeSubscription.billing,
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
          },
        },
      };

      return NextResponse.json(response, { status: 200 });
    }

    // Initialize Razorpay with your keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // ── Resolve plan ───────────────────────────────────────────────────────
    const planId = resolvePlanId(tier, billing, currency);
    const options: RazorpayCreateSubscriptionRequest = {
      plan_id:         planId,
      total_count:     TOTAL_COUNT[billing],
      quantity:        1,
      customer_notify: 1,               // Razorpay sends payment link to customer
      notes: {
        userId:   user._id.toString(),
        tier,
        billing,
        currency,
      },
    };
 
    const subscription = await razorpay.subscriptions.create(options);
    const plan = await razorpay.plans.fetch(planId);
    const price = typeof plan.item?.amount === 'number' ? plan.item.amount : undefined;

    await PaymentHistoryModel.create({
      userId: user._id,
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      tier,
      billing,
      currency,
      totalCount: TOTAL_COUNT[billing],
      quantity: 1,
      price: price,
      status: PaymentStatus.PENDING,
      shortUrl: subscription.short_url,
    });

    const response: ApiResponse<CreatedSubscriptionResponse> = {
      success: true,
      message: 'Subscription created successfully',
      data: {
        id:          subscription.id,
        plan_id:     subscription.plan_id,
        status:      subscription.status,
        short_url:   subscription.short_url,
        currency,
        tier,
        billing,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        }
      },
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    // console.error("❌ Razorpay subscription creation failed:", {
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