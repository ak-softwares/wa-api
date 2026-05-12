import { fetchAuthenticatedUser } from '@/services/apiHelper/getDefaultWaAccount';
import { CreatedSubscriptionResponse, RazorpayCreateSubscriptionRequest } from '@/types/Razorpay-web';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { ApiResponse } from '@/types/apiResponse';
import { SubscriptionPaymentHistoryModel } from '@/models/SubscriptionPaymentHistory';
import { SubscriptionPaymentStatus } from '@/types/SubscriptionPaymentHistory';
import { SubscriptionStatus, UserSubscriptionModel } from '@/models/Subscription';
 
// ─── Plan config ────────────────────────────────────────────────────────────
 
type PlanTier     = 'STARTER' | 'GROWTH';
type BillingCycle = 'MONTHLY' | 'YEARLY';
type Currency     = 'INR' | 'USD';
 
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

    // Initialize Razorpay with your keys
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    // ── Validate body ──────────────────────────────────────────────────────
    const body = await req.json();
    const { tier, billing, currency } = body as {
      tier:     PlanTier;
      billing:  BillingCycle;
      currency: Currency;
    };
 
    const validTiers    = ['STARTER', 'GROWTH']  as const;
    const validBillings = ['MONTHLY', 'YEARLY']  as const;
    const validCurrencies = ['INR', 'USD']        as const;
 
    if (
      !validTiers.includes(tier)         ||
      !validBillings.includes(billing)   ||
      !validCurrencies.includes(currency)
    ) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid plan configuration. tier, billing, and currency are required.',
      };
      return NextResponse.json(response, { status: 400 });
    }
 
    // ── Resolve plan ───────────────────────────────────────────────────────
    const planId = resolvePlanId(tier, billing, currency);
    console.log(`Creating Razorpay subscription for user ${user._id} with planId ${planId}`);
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

    await UserSubscriptionModel.create({
      userId: user._id,
      subscriptionId: subscription.id,
      planId,
      tier,
      billing,
      currency,
      status: SubscriptionStatus.CREATED,
      totalCount: TOTAL_COUNT[billing],
      paidCount: 0,
      remainingCount: TOTAL_COUNT[billing],
      shortUrl: subscription.short_url,
    });

    await SubscriptionPaymentHistoryModel.create({
      userId: user._id,
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      tier,
      billing,
      currency,
      totalCount: TOTAL_COUNT[billing],
      quantity: 1,
      status: SubscriptionPaymentStatus.PENDING,
      shortUrl: subscription.short_url,
    });

    const response: ApiResponse<CreatedSubscriptionResponse> = {
      success: true,
      message: 'Subscription created successfully',
      data: {
        id:          subscription.id,
        plan_id:     subscription.plan_id,
        status:      subscription.status,
        short_url:   subscription.short_url,  // hosted payment page from Razorpay
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
    console.error("❌ Razorpay subscription creation failed:", {
      message: error?.message,
      stack: error?.stack,
      razorpay: error?.error,
    });

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