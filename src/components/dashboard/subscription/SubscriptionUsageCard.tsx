"use client";

import Link from "next/link";
import {
  CalendarDays,
  Crown,
  MessageSquareText,
  TrendingUp,
  Zap,
  RefreshCw,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionUsage } from "@/hooks/subscription/useSubscriptionUsage";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(value: number | null) {
  if (value === null) return "∞";
  return value.toLocaleString();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

// ─── Metric card (same pattern as AnalyticsCard) ─────────────────────────────

function MetricCard({
  label,
  value,
  icon,
  subValue,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
}) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <p className="text-xl font-bold">{value}</p>
        {subValue && (
          <span className="text-xs text-muted-foreground">({subValue})</span>
        )}
      </div>
    </div>
  );
}

// ─── No-subscription empty state ─────────────────────────────────────────────

function NoSubscriptionState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4 text-[#0B8576] dark:text-[#4EDCC8]" />
          Subscription & Usage
        </CardTitle>
        <CardDescription>You don't have an active plan yet.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">No active subscription</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Subscribe to a plan to start sending messages. A free plan gives
            you&nbsp;100 messages every month — no credit card required.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/billing">
            Get started <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubscriptionUsageCard() {
  const { data, loading, error } = useSubscriptionUsage();

  // ── Loading ──
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Error ──
  if (error || !data) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="p-6">
          <p className="text-sm text-destructive">
            {error || "Unable to load subscription usage."}
          </p>
        </CardContent>
      </Card>
    );
  }

  // ── No subscription at all — prompt user to subscribe ──
  // subscriptionId is null when no record exists in DB
  if (!data.subscriptionId) {
    return <NoSubscriptionState />;
  }

  const isFree = data.tier === "FREE";

  // ── Tier badge colour ──
  const tierBadgeClass = isFree
    ? "bg-slate-500 hover:bg-slate-500"
    : "bg-emerald-500 hover:bg-emerald-500";

  return (
    <Card>
      {/* ── Header — mirrors AnalyticsCard layout ── */}
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-[#0B8576] dark:text-[#4EDCC8]" />
            Subscription & Usage
          </CardTitle>
          <CardDescription className="text-sm">
            {isFree
              ? "Free plan · 100 messages/month, resets every 1st"
              : "Track this month's message usage and your active plan limit"}
          </CardDescription>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge className={tierBadgeClass}>{data.planName}</Badge>
          {isFree && (
            <Button asChild size="sm">
              <Link href="/dashboard/billing">
                Upgrade <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ── Usage progress bar (hidden for unlimited plans) ── */}
        {!data.isUnlimited && (
          <div className="rounded-lg border bg-background/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Monthly message usage</p>
                <p className="text-xs text-muted-foreground">
                  {data.usagePercent}% of monthly limit used
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">
                {data.usedMessages.toLocaleString()} /{" "}
                {data.messageLimit.toLocaleString()}
              </p>
            </div>
            <Progress value={data.usagePercent} className="h-2" />
          </div>
        )}

        {/* ── Metrics grid — same pattern as AnalyticsCard ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Used"
            value={formatNumber(data.usedMessages)}
            icon={
              <MessageSquareText className="h-4 w-4 text-muted-foreground" />
            }
          />

          <MetricCard
            label="Remaining"
            value={formatNumber(data.remainingMessages)}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />

          <MetricCard
            label="Limit / mo"
            value={data.isUnlimited ? "∞" : formatNumber(data.messageLimit)}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />

          <MetricCard
            label={isFree ? "Resets" : "Renews"}
            value={formatDate(data.renewsAt)}
            icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* ── Free-plan auto-reset note ── */}
        {isFree && (
          <div className="flex items-start gap-2.5 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Your free plan resets to&nbsp;
              <span className="font-medium text-foreground">
                100 messages
              </span>{" "}
              on the&nbsp;
              <span className="font-medium text-foreground">
                1st of every month
              </span>{" "}
              automatically — no action needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}