"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePricing } from "@/hooks/subscription/usePlans";
import { useRazorpaySubscription } from "@/hooks/razorpay/useRazorpaySubscription";
import { usePaymentHistory } from "@/hooks/subscription/usePaymentHistory";
import { PaymentHistory, PaymentStatus } from "@/types/PaymentHistory";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshButton } from "@/components/global/header/Refresh";
import dayjs from "dayjs";

// ── Currency helpers ──────────────────────────────────────────────────────────

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

function currencySymbol(currency: string) {
  return CURRENCY_SYMBOL[currency] ?? currency;
}

function formatPrice(price: number, currency: string) {
  return price.toLocaleString(currency === "INR" ? "en-IN" : undefined, {
    maximumFractionDigits: 0,
  });
}

/** Format an amount that arrives in smallest unit (paise / cents) */
function formatPaymentAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

function formatMessages(n: number | null): string {
  if (n == null || n < 0) return "Unlimited";
  return n.toLocaleString();
}

function getPlanLabel(
  tier: PaymentHistory["tier"],
  billing: PaymentHistory["billing"]
) {
  const tierLabel = tier === "STARTER" ? "Starter" : "Growth";
  const billingLabel = billing === "MONTHLY" ? "Monthly" : "Yearly";
  return `${tierLabel} · ${billingLabel}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Plan = ReturnType<typeof usePricing>["plans"][number];

// ── Status badge colors ───────────────────────────────────────────────────────

const STATUS_BADGE: Record<PaymentStatus, { badge: string; dot: string }> = {
  [PaymentStatus.PAID]: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  [PaymentStatus.COMPLETED]: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  [PaymentStatus.ACTIVE]: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  [PaymentStatus.AUTHENTICATED]: {
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  [PaymentStatus.PENDING]: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  [PaymentStatus.HALTED]: {
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  [PaymentStatus.CANCELLED]: {
    badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  [PaymentStatus.FAILED]: {
    badge: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    dot: "bg-red-500",
  },
};

// ── Invoice row (from PaymentHistoryPage) ─────────────────────────────────────

function InvoiceRow({ payment }: { payment: PaymentHistory }) {
  const sym = currencySymbol(payment.currency);
  const { badge, dot } = STATUS_BADGE[payment.status];
  const planLabel = getPlanLabel(payment.tier, payment.billing);
  const dateLabel = payment.createdAt
    ? dayjs(payment.createdAt).format("DD MMM YYYY, hh:mm A")
    : "—";

  return (
    <div
      className="mx-0 mb-2 flex items-center justify-between rounded-xl border
                 border-gray-200 bg-white px-4 py-3.5 transition-colors duration-150
                 hover:bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#141414]
                 dark:hover:bg-[#1A1A1A]"
    >
      {/* Left — icon + plan + date */}
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                     bg-gray-100 text-base dark:bg-white/10"
        >
          🧾
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {planLabel}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
            {dateLabel}
          </p>
          {payment.shortUrl &&
            [
              PaymentStatus.PENDING,
              PaymentStatus.HALTED,
              PaymentStatus.FAILED,
            ].includes(payment.status) && (
              <a
                href={payment.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-block text-xs text-blue-500 hover:underline dark:text-blue-400"
              >
                Complete payment ↗
              </a>
            )}
        </div>
      </div>

      {/* Right — status + amount */}
      <div className="ml-3 flex shrink-0 items-center gap-3">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {payment.status}
        </span>

        <p className="tabular-nums text-sm font-bold text-gray-900 dark:text-white">
          {sym}
          {formatPaymentAmount(payment.price, payment.currency)}
        </p>
      </div>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function PaymentSkeleton() {
  return (
    <div className="mb-2 flex min-h-[68px] items-center justify-between rounded-xl border border-gray-200 px-4 py-3.5 dark:border-[#2A2A2A]">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  currency,
  billingCycle,
  currentTier,
  onSelect,
  loadingTier,
}: {
  plan: Plan;
  currency: string;
  billingCycle: "MONTHLY" | "YEARLY";
  currentTier: string | null;
  onSelect: (tier: string) => void;
  loadingTier: string | null;
}) {
  const sym = currencySymbol(currency);
  const isEnterprise = plan.price == null;
  const isCurrent = plan.tier === currentTier;
  const isLoading = loadingTier === plan.tier;
  const isFree = plan.price === 0;

  const buttonLabel = isCurrent
    ? "Current Plan"
    : isEnterprise
    ? "Contact Sales"
    : isFree
    ? "Downgrade to Free"
    : "Upgrade";

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-200 ${
        plan.highlighted
          ? "border-emerald-500 bg-gradient-to-b from-emerald-50/70 to-white shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20 dark:from-emerald-950/40 dark:to-[#111]"
          : isCurrent
          ? "border-blue-400/60 bg-blue-50/40 dark:bg-blue-950/20"
          : "border-[#e5e7eb] bg-white dark:border-white/10 dark:bg-white/[0.03]"
      } p-6`}
    >
      {plan.badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[11px] font-bold tracking-wide ${
            plan.highlighted
              ? "bg-emerald-500 text-white"
              : "border border-[#e5e7eb] bg-white text-gray-500 dark:border-white/10 dark:bg-[#111]"
          }`}
        >
          {plan.badge}
        </span>
      )}

      {isCurrent && (
        <span className="absolute -top-3 right-5 rounded-full border border-blue-300 bg-blue-100 px-3 py-0.5 text-[11px] font-bold tracking-wide text-blue-600 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400">
          Active
        </span>
      )}

      <div className="mb-5 mt-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
          {plan.tier}
        </p>
        <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
          {plan.name}
        </h3>

        <div className="mt-3 flex items-end gap-1">
          {isEnterprise ? (
            <span className="text-4xl font-black text-gray-900 dark:text-white">
              Custom
            </span>
          ) : isFree ? (
            <>
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                {sym}0
              </span>
              <span className="mb-1 text-sm text-gray-400">/mo</span>
            </>
          ) : (
            <>
              <span className="text-4xl font-black text-gray-900 dark:text-white">
                {sym}
                {formatPrice(plan.price!, currency)}
              </span>
              <span className="mb-1 text-sm text-gray-400">/mo</span>
            </>
          )}
        </div>

        {billingCycle === "YEARLY" && !isEnterprise && !isFree && (
          <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            Billed annually · 2 months free
          </p>
        )}

        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {plan.description}
        </p>
      </div>

      <div
        className={`mb-5 rounded-xl border px-4 py-3 text-center ${
          plan.highlighted
            ? "border-emerald-400/30 bg-emerald-500/10"
            : "border-[#e5e7eb] bg-gray-50 dark:border-white/10 dark:bg-white/5"
        }`}
      >
        <p
          className={`text-lg font-extrabold ${
            plan.highlighted
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-gray-800 dark:text-white"
          }`}
        >
          {formatMessages(plan.messagesPerMonth)}
        </p>
        <p className="mt-0.5 text-[10px] text-gray-400">
          messages / month · + Meta API charges
        </p>
      </div>

      <button
        disabled={isCurrent || isLoading}
        onClick={() => !isCurrent && onSelect(plan.tier)}
        className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-150 ${
          isCurrent
            ? "cursor-default border border-[#e5e7eb] bg-gray-100 text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500"
            : plan.highlighted
            ? "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:shadow-md"
            : "border border-[#e5e7eb] bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Processing…
          </span>
        ) : (
          buttonLabel
        )}
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const { data: session } = useSession();

  const { plans, currency, setCurrency, billingCycle, setBillingCycle, loading } =
    usePricing();

  const { initiateSubscription, loading: paymentLoading } =
    useRazorpaySubscription();

  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(
    null
  );

  // ── Payment history ──────────────────────────────────────────────────────
  const invoiceContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    paymentHistory,
    loading: historyLoading,
    loadingMore,
    hasMore,
    totalRecords,
    refreshPaymentHistory,
  } = usePaymentHistory({ containerRef: invoiceContainerRef });

  // Mock current tier — replace with actual subscription data from your API
  const currentTier = "FREE";

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSelectPlan = async (tier: string) => {
    if (tier === "ENTERPRISE") {
      window.location.href = "/contact";
      return;
    }
    setLoadingTier(tier);
    await initiateSubscription({
      tier,
      billing: billingCycle,
      currency,
      onSuccess: () => {
        showToast("success", "Subscription activated! Your plan has been updated.");
        setLoadingTier(null);
      },
      onFailure: (err) => {
        showToast("error", err || "Payment failed. Please try again.");
        setLoadingTier(null);
      },
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] px-4 py-10 dark:bg-[#0d0d0f]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl bg-gray-200 dark:bg-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans text-gray-900 dark:bg-[#0d0d0f] dark:text-white">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl border px-5 py-3.5 shadow-xl backdrop-blur transition-all ${
            toast.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* ── Page header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/dashboard" className="hover:text-gray-600 dark:hover:text-white">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-white">Billing</span>
          </div>
          <h1 className="mt-3 text-2xl font-black tracking-tight">
            Billing &amp; Subscription
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your plan, payment method, and invoice history.
          </p>
        </div>

        {/* ── Current plan summary ── */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white dark:border-white/10 dark:bg-white/[0.03]">
          <div className="border-b border-[#e5e7eb] px-6 py-4 dark:border-white/10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Current Subscription
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl dark:bg-emerald-950">
                🤖
              </div>
              <div>
                <p className="text-lg font-extrabold">Free Plan</p>
                <p className="text-xs text-gray-400">
                  100 messages / month · Renews monthly
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
              <div className="rounded-lg border border-[#e5e7eb] bg-gray-50 px-4 py-2 dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Messages used
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: "64%" }}
                    />
                  </div>
                  <span className="text-xs font-bold">64 / 100</span>
                </div>
              </div>
              <button className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
                Manage Payment
              </button>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold">Change Plan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              All plans include every feature. Only message volume differs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Billing toggle */}
            <div className="flex items-center rounded-xl border border-[#e5e7eb] bg-white p-1 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <button
                onClick={() => setBillingCycle("MONTHLY")}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                  billingCycle === "MONTHLY"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("YEARLY")}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
                  billingCycle === "YEARLY"
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                    : "text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                Yearly
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    billingCycle === "YEARLY"
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                  }`}
                >
                  −17%
                </span>
              </button>
            </div>

            {/* Currency picker */}
            <div className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <span className="text-gray-400">💱</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "INR" | "USD")}
                className="bg-transparent text-xs font-semibold focus:outline-none dark:text-white"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
              </select>
            </div>
          </div>
        </div>

        {billingCycle === "YEARLY" && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-400">
            🎉 Annual billing — pay for 10 months, get 2 months free!
          </div>
        )}

        {/* ── Plan cards ── */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.tier}
              plan={plan}
              currency={currency}
              billingCycle={billingCycle}
              currentTier={currentTier}
              onSelect={handleSelectPlan}
              loadingTier={loadingTier}
            />
          ))}
        </div>

        {/* ── Meta note ── */}
        <div className="mb-12 rounded-2xl border border-amber-200 bg-amber-50/60 px-6 py-5 dark:border-amber-700/30 dark:bg-amber-950/20">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 shrink-0 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                Meta / Facebook WhatsApp API charges are billed separately by Meta
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700 dark:text-amber-500">
                Our plan fee covers platform access only. Meta charges per WhatsApp
                conversation (varies by type and recipient country) and bills directly to
                your Facebook Business Manager account.{" "}
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

        {/* ── Payment / Invoice history ── */}
        <div>
          {/* Section header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">
                Payment History{" "}
                {!historyLoading && (
                  <span className="text-sm font-normal text-gray-500">
                    ({totalRecords})
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your past payments and receipts.
              </p>
            </div>
            <RefreshButton onClick={refreshPaymentHistory} />
          </div>

          {/* Scrollable list with infinite scroll */}
          <div
            ref={invoiceContainerRef}
            className="max-h-[480px] overflow-y-auto rounded-2xl"
          >
            {historyLoading ? (
              // Initial load skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <PaymentSkeleton key={i} />
              ))
            ) : paymentHistory.length === 0 ? (
              // Empty state
              <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
                <p className="text-3xl">🧾</p>
                <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-white">
                  No payment records found.
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Your payment receipts will appear here once you upgrade.
                </p>
              </div>
            ) : (
              <>
                {paymentHistory.map((payment) => (
                  <InvoiceRow
                    key={payment._id ?? payment.subscriptionId}
                    payment={payment}
                  />
                ))}

                {/* Infinite scroll — loading more */}
                {hasMore &&
                  loadingMore &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <PaymentSkeleton key={`more-${i}`} />
                  ))}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}