"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { ArrowUpRight, Crown } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionUsage } from "@/hooks/subscription/useSubscriptionUsage";
import { useSubscriptionUsageCtx } from "@/context/subscription/SubscriptionUsageContext";

// ─── Loading skeleton ─────────────────────────────────────────────────────────
interface StateProps {
  bgClass: string;
}

function CurrentPlanSkeleton({ bgClass }: StateProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 ${bgClass}`}>
      <div className="border-b border-gray-200 px-6 py-4 dark:border-white/10">
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-5">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ message, bgClass }: { message: string; bgClass: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-red-200 ${bgClass} dark:border-red-900/40`}>
      <div className="border-b border-red-200 px-6 py-4 dark:border-red-900/40">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Current Subscription
        </p>
      </div>
      <div className="px-6 py-5">
        <p className="text-sm text-red-500">{message}</p>
      </div>
    </div>
  );
}

// ─── No-subscription state ────────────────────────────────────────────────────

function NoSubscriptionState({ bgClass }: { bgClass: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[#e5e7eb] ${bgClass} dark:border-white/10`}>
      {/* Header */}
      <div className="border-b border-[#e5e7eb] px-6 py-4 dark:border-white/10">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Current Subscription
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center sm:flex-row sm:text-left">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-3xl dark:bg-white/10">
          🎁
        </div>
        <div className="flex-1">
          <p className="text-base font-extrabold text-gray-900 dark:text-white">
            No active subscription
          </p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            You&apos;re not on any plan yet. Start with the free plan — 100
            messages every month at no cost, resets on the 1st automatically.
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          Get started <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface CurrentSubscriptionCardProps {
  bgClass?: string;
}
export default function CurrentSubscriptionCard({
  bgClass = "bg-[#F9FAFB] dark:bg-[#1D1E1E]",
}: CurrentSubscriptionCardProps) {
  const { data, loading, error } = useSubscriptionUsageCtx();

  // ── Loading ──
  if (loading) return <CurrentPlanSkeleton bgClass={bgClass} />;

  // ── Error ──
  if (error || !data) {
    return (
      <ErrorState message={error ?? "Unable to load subscription details."} bgClass={bgClass} />
    );
  }

  // ── No subscription in DB ──
  if (!data.subscriptionId) return <NoSubscriptionState bgClass={bgClass} />;

  // ── Derived values ────────────────────────────────────────────────────────
  const isFree          = data.tier === "FREE";
  const planDisplayName = data.planName;
  const usagePercent    = data.usagePercent;
  const usedMessages    = data.usedMessages;
  const messageLimit    = data.messageLimit;
  const renewsAt        = data.renewsAt
    ? dayjs(data.renewsAt).format("DD MMM YYYY")
    : "—";

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#e5e7eb] dark:border-white/10 ${bgClass}`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-6 py-4 dark:border-white/10">
        <Crown className="h-3.5 w-3.5 text-[#0B8576] dark:text-[#4EDCC8]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Current Subscription
        </p>
      </div>

      {/* ── Active plan body ── */}
      <div className="flex flex-wrap items-center justify-between gap-6 px-6 py-5">

        {/* Left — plan info */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl dark:bg-emerald-950">
            🤖
          </div>
          <div>
            <p className="text-lg font-extrabold text-gray-900 dark:text-white">
              {planDisplayName}
            </p>
            <p className="text-xs text-gray-400">
              {`${messageLimit.toLocaleString()} messages / month`}
              {" · "}
              {isFree
                ? "Resets every 1st"
                : data.billing === "YEARLY"
                ? "Billed yearly"
                : "Billed monthly"}
            </p>
          </div>
        </div>

        {/* Right — status + metrics */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Active badge */}
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
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums">
                {usedMessages.toLocaleString()} /{" "}
                {messageLimit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Renews / Resets date */}
          <div className="rounded-lg border border-[#e5e7eb] bg-gray-50 px-4 py-2 dark:border-white/10 dark:bg-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              {isFree ? "Resets" : "Renews"}
            </p>
            <p className="mt-0.5 text-xs font-bold">{renewsAt}</p>
          </div>

          {/* Upgrade CTA for free plan */}
          {isFree && (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Upgrade <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Free-plan auto-reset notice ── */}
      {isFree && (
        <div className="border-t border-dashed border-gray-200 px-6 py-3 dark:border-white/10">
          <p className="text-xs text-gray-400">
            🔄 Your 100-message quota resets automatically on the 1st of every
            month — no action needed.
          </p>
        </div>
      )}
    </div>
  );
}