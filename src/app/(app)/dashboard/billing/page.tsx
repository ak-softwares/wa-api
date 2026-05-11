'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

import { usePricing } from '@/hooks/pricing/usePricing';
import { useRazorpaySubscription } from '@/hooks/razorpay/useRazorpaySubscription';

// ───────────────────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string) {
  return `${currency} ${price.toLocaleString(
    currency === 'INR' ? 'en-IN' : undefined
  )}`;
}

// ───────────────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { data: session } = useSession();

  const [status, setStatus] = useState<string | null>(null);

  const {
    plans,
    currency,
    setCurrency,
    billingCycle,
    setBillingCycle,
    loading: pricingLoading,
  } = usePricing();

  const {
    initiateSubscription,
    loading: subscriptionLoading,
  } = useRazorpaySubscription();

  // ── Paid plans only ────────────────────────────────────────────────────────

  const paidPlans = useMemo(() => {
    return plans.filter(
      (plan) =>
        plan.price !== null &&
        plan.price! > 0
    );
  }, [plans]);

  // ── Selected plan ──────────────────────────────────────────────────────────

  const [selectedPlanTier, setSelectedPlanTier] =
    useState<string>('');

  useEffect(() => {
    if (!selectedPlanTier && paidPlans.length > 0) {
      setSelectedPlanTier(paidPlans[0].tier);
    }
  }, [paidPlans, selectedPlanTier]);

  const selectedPlan = useMemo(() => {
    return (
      paidPlans.find(
        (plan) => plan.tier === selectedPlanTier
      ) ?? null
    );
  }, [paidPlans, selectedPlanTier]);

  // ── Subscribe ──────────────────────────────────────────────────────────────

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    setStatus(null);

    await initiateSubscription({
      tier: selectedPlan.tier,
      billing: billingCycle,
      currency,

      onSuccess: () => {
        setStatus(
          'Subscription created successfully. Redirecting to Razorpay...'
        );
      },

      onFailure: (error) => {
        setStatus(error);
      },
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (pricingLoading) {
    return (
      <main className="p-6">
        Loading billing...
      </main>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="mx-auto max-w-5xl p-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">
          Billing
        </h1>

        <p className="mt-2 text-muted-foreground">
          Choose a subscription plan and continue
          with Razorpay.
        </p>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-wrap gap-4">

        {/* Billing Cycle */}
        <div className="flex rounded-full border border-border p-1">

          <button
            type="button"
            onClick={() =>
              setBillingCycle('MONTHLY')
            }
            className={`rounded-full px-5 py-2 text-sm transition ${
              billingCycle === 'MONTHLY'
                ? 'bg-emerald-500 text-white'
                : ''
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() =>
              setBillingCycle('YEARLY')
            }
            className={`rounded-full px-5 py-2 text-sm transition ${
              billingCycle === 'YEARLY'
                ? 'bg-emerald-500 text-white'
                : ''
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Currency */}
        <select
          value={currency}
          onChange={(e) =>
            setCurrency(
              e.target.value as 'INR' | 'USD'
            )
          }
          className="rounded-full border border-border bg-background px-4 py-2 text-sm"
        >
          <option value="INR">
            INR (₹)
          </option>

          <option value="USD">
            USD ($)
          </option>
        </select>
      </div>

      {/* Plans */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {paidPlans.map((plan) => {
          const isSelected =
            selectedPlan?.tier === plan.tier;

          return (
            <button
              key={plan.tier}
              type="button"
              onClick={() =>
                setSelectedPlanTier(plan.tier)
              }
              className={`rounded-2xl border p-5 text-left transition ${
                isSelected
                  ? 'border-emerald-500 ring-2 ring-emerald-400/40'
                  : 'border-border hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {plan.name}
                </h2>

                {plan.badge && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                    {plan.badge}
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {plan.description}
              </p>

              <div className="mt-5 text-3xl font-bold">
                {formatPrice(
                  plan.price!,
                  plan.currency
                )}
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                /
                {billingCycle === 'MONTHLY'
                  ? 'month'
                  : 'year'}
              </div>

              <div className="mt-4 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                {plan.messagesPerMonth < 0
                  ? 'Unlimited messages'
                  : `${plan.messagesPerMonth.toLocaleString()} messages/month`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="mt-10 rounded-2xl border border-border p-6">

        <h2 className="text-xl font-semibold">
          Order Summary
        </h2>

        <div className="mt-5 space-y-3 text-sm">

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              User
            </span>

            <span>
              {session?.user?.email ??
                'Authenticated user'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Plan
            </span>

            <span className="font-medium">
              {selectedPlan?.name ?? '-'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Billing Cycle
            </span>

            <span className="font-medium">
              {billingCycle}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Currency
            </span>

            <span className="font-medium">
              {currency}
            </span>
          </div>

          <div className="border-t border-border pt-4">

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>

              <span>
                {selectedPlan?.price
                  ? formatPrice(
                      selectedPlan.price,
                      currency
                    )
                  : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubscribe}
          disabled={
            subscriptionLoading || !selectedPlan
          }
          className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {subscriptionLoading
            ? 'Processing...'
            : 'Continue to Payment'}
        </button>

        {/* Status */}
        {status && (
          <p className="mt-4 text-sm text-muted-foreground">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}