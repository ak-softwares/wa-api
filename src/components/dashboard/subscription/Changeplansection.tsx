'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePricing } from '@/hooks/subscription/usePlans';
import { useSubscriptionUsageCtx } from '@/context/subscription/SubscriptionUsageContext';
import { useRazorpaySubscription } from '@/hooks/razorpay/useRazorpaySubscription';

// ── Toast ─────────────────────────────────────────────────────────────────────

type Toast = { type: 'success' | 'error'; msg: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£',
};

function currencySymbol(c: string) { return CURRENCY_SYMBOL[c] ?? c; }

function formatPrice(price: number, currency: string) {
  return price.toLocaleString(currency === 'INR' ? 'en-IN' : undefined, {
    maximumFractionDigits: 0,
  });
}

function formatMessages(n: number | null): string {
  if (n == null || n < 0) return 'Unlimited';
  return n.toLocaleString();
}

const TIER_ORDER: Record<string, number> = {
  FREE: 0, STARTER: 1, GROWTH: 2, ENTERPRISE: 3,
};

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = ReturnType<typeof usePricing>['plans'][number];

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  currency,
  billingCycle,
  currentTier,
  onSelect,
  loadingTier,
}: {
  plan:         Plan;
  currency:     string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  currentTier:  string | null;   // null when no subscription exists → no Active badge shown
  onSelect:     (tier: string) => void;
  loadingTier:  string | null;
}) {
  const sym          = currencySymbol(currency);
  const isEnterprise = plan.price == null;
  const isCurrent    = plan.tier === currentTier;
  const isLoading    = loadingTier === plan.tier;
  const isFree       = plan.price === 0;
  const isDowngrade  =
    !isCurrent &&
    currentTier != null &&
    TIER_ORDER[plan.tier] < TIER_ORDER[currentTier];

  const buttonLabel = isCurrent
    ? 'Current Plan'
    : isEnterprise
    ? 'Contact Sales'
    : isFree
    ? 'Switch to Free'
    : isDowngrade
    ? 'Downgrade'
    : 'Upgrade';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-200 ${
        plan.highlighted
          ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/70 to-white shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20 dark:from-emerald-950/40 dark:to-[#111]'
          : isCurrent
          ? 'border-blue-400/60 bg-blue-50/40 dark:bg-blue-950/20'
          : 'border-[#e5e7eb] bg-white dark:border-white/10 dark:bg-white/[0.03]'
      }`}
    >
      {/* Plan badge */}
      {plan.badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wide ${
            plan.highlighted
              ? 'bg-emerald-500 text-white'
              : 'border border-[#e5e7eb] bg-white text-gray-500 dark:border-white/10 dark:bg-[#111]'
          }`}
        >
          {plan.badge}
        </span>
      )}

      {/*
        Active badge: only rendered when isCurrent is true.
        isCurrent can only be true when currentTier is non-null,
        which only happens when data.subscriptionId exists (see parent).
      */}
      {isCurrent && (
        <span className="absolute -top-3 right-5 rounded-full border border-blue-300 bg-blue-100 px-3 py-0.5 text-[11px] font-bold tracking-wide text-blue-600 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400">
          Active
        </span>
      )}

      {/* Plan details */}
      <div className="mt-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {plan.tier}
        </p>
        <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
          {plan.name}
        </h3>

        <div className="mt-3 flex items-end gap-1">
          {isEnterprise ? (
            <span className="text-4xl font-black text-gray-900 dark:text-white">Custom</span>
          ) : isFree ? (
            <>
              <span className="text-4xl font-black text-gray-900 dark:text-white">{sym}0</span>
              <span className="mb-1 text-sm text-gray-400">/mo</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                {sym}{formatPrice(plan.price!, currency)}
              </span>
              <span className="mb-1 text-sm text-gray-400">/mo</span>
            </>
          )}
        </div>

        {billingCycle === 'YEARLY' && !isEnterprise && !isFree && (
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            Billed annually · 2 months free
          </p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {plan.description}
        </p>
      </div>

      {/* ↓ This wrapper snaps to the bottom of every card */}
<div className="mt-auto flex flex-col gap-4 pt-5">

  {/* Message quota */}
  <div className={`rounded-xl border px-4 py-3 text-center ${
    plan.highlighted
      ? 'border-emerald-400/30 bg-emerald-500/10'
      : 'border-[#e5e7eb] bg-gray-50 dark:border-white/10 dark:bg-white/5'
  }`}>
    <p className={`text-lg font-extrabold ${
      plan.highlighted ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-800 dark:text-white'
    }`}>
      {formatMessages(plan.messagesPerMonth)}
    </p>
    <p className="mt-0.5 text-[10px] text-gray-400">
      messages / month · + Meta API charges
    </p>
  </div>

  {/* CTA button */}
  <button
    disabled={isCurrent || isLoading}
    onClick={() => !isCurrent && onSelect(plan.tier)}
    className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-150 ${
      isCurrent
        ? 'cursor-default border border-[#e5e7eb] bg-gray-100 text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500'
        : plan.highlighted
        ? 'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md'
        : 'border border-[#e5e7eb] bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10'
    }`}
  >
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Processing…
      </span>
    ) : buttonLabel}
  </button>

</div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function ChangePlanSection() {
  const { plans, currency, setCurrency, billingCycle, setBillingCycle, loading } = usePricing();
  const { initiateSubscription } = useRazorpaySubscription();

  // ── Shared subscription data from context ──────────────────────────────────
  const { data, refetch: refetchUsage } = useSubscriptionUsageCtx();

  /*
    Show the Active badge only when a real subscription record exists in the DB.
    If data.subscriptionId is absent (user has never subscribed), currentTier is
    null → no card renders as "Current Plan".
  */
  const currentTier = data?.subscriptionId ? (data.tier ?? null) : null;

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [toast, setToast]             = useState<Toast | null>(null);

  const showToast = (type: Toast['type'], msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Plan selection (FREE + paid unified through the hook) ──────────────────
  const handleSelectPlan = async (
    tier:     string,
    billing:  'MONTHLY' | 'YEARLY',
    currency: string,
  ) => {
    if (tier === 'ENTERPRISE') { window.location.href = '/contact'; return; }

    setLoadingTier(tier);

    await initiateSubscription({
      tier,
      billing,
      currency,
      onSuccess: () => {
        const msg =
          tier === 'FREE'
            ? 'Free plan activated! You have 100 messages this month.'
            : 'Subscription activated! Your plan has been updated.';
        showToast('success', msg);
        setLoadingTier(null);
        refetchUsage();
      },
      onFailure: (err) => {
        showToast('error', err || 'Something went wrong. Please try again.');
        setLoadingTier(null);
      },
    });
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-white/10" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="mb-12">
        {/* ── Section header + controls ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Change Plan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All plans include every feature. Only message volume differs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Monthly / Yearly toggle */}
            <div className="flex items-center rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <button
                onClick={() => setBillingCycle('MONTHLY')}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                  billingCycle === 'MONTHLY'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('YEARLY')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                  billingCycle === 'YEARLY'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                Yearly
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                  billingCycle === 'YEARLY'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                }`}>
                  −17%
                </span>
              </button>
            </div>

            {/* Currency picker */}
            <div className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-gray-400">💱</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')}
                className="bg-transparent text-xs font-semibold focus:outline-none dark:text-white"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Yearly savings banner */}
        {billingCycle === 'YEARLY' && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            🎉 Annual billing — pay for 10 months, get 2 months free!
          </div>
        )}

        {/* ── Plan cards grid ── */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              currency={currency}
              billingCycle={billingCycle}
              currentTier={currentTier}
              loadingTier={loadingTier}
              onSelect={(tier) => handleSelectPlan(tier, billingCycle, currency)}
            />
          ))}
        </div>

        {/* ── Meta charges note ── */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 px-6 py-5 dark:border-amber-700/30 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                Meta / Facebook WhatsApp API charges are billed separately by Meta
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-500">
                Our plan fee covers platform access only. Meta charges per WhatsApp
                conversation (varies by type and recipient country) and bills directly
                to your Facebook Business Manager account.{' '}
                <Link
                  href="https://whatsappbusiness.com/products/platform-pricing/"
                  target="_blank"
                  className="font-semibold underline hover:no-underline"
                >
                  View Meta's pricing →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Toast (lives here so BillingPage stays clean) ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          {toast.msg}
        </div>
      )}
    </>
  );
}