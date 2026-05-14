"use client";

import Link from "next/link";
import {
  CalendarDays,
  Crown,
  MessageSquareText,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscriptionUsage } from "@/hooks/subscription/useSubscriptionUsage";

function formatNumber(value: number | null) {
  if (value === null) return "Unlimited";
  return value.toLocaleString();
}

function formatDate(value: string | null) {
  if (!value) return "No renewal date";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function SubscriptionUsageCard() {
  const { data, loading, error } = useSubscriptionUsage();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-3 w-full" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <Card className="overflow-hidden border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 dark:border-emerald-900/40 dark:from-card dark:to-emerald-950/20">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <Crown className="h-5 w-5" />
            </div>
            <CardTitle>Subscription & limits</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Track this month&apos;s message usage and your active plan limit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-500 hover:bg-emerald-500">
            {data.planName}
          </Badge>
          <Button asChild size="sm">
            <Link href="/dashboard/billing">Upgrade</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-xl border bg-background/70 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Monthly message usage</p>
              <p className="text-xs text-muted-foreground">
                {data.isUnlimited
                  ? "Unlimited messages included in this plan"
                  : `${data.usagePercent}% of monthly limit used`}
              </p>
            </div>
            <p className="text-sm font-semibold">
              {formatNumber(data.usedMessages)} / {data.isUnlimited
                ? "Unlimited"
                : formatNumber(data.messageLimit)}
            </p>
          </div>
          <Progress
            value={data.usagePercent}
            className="h-2 bg-emerald-100 dark:bg-emerald-950"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-background/70 p-4">
            <MessageSquareText className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="text-xs text-muted-foreground">Used</p>
            <p className="text-lg font-semibold">
              {formatNumber(data.usedMessages)}
            </p>
          </div>

          <div className="rounded-xl border bg-background/70 p-4">
            <TrendingUp className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className="text-lg font-semibold">
              {formatNumber(data.remainingMessages)}
            </p>
          </div>

          <div className="rounded-xl border bg-background/70 p-4">
            <CalendarDays className="mb-3 h-5 w-5 text-emerald-600" />
            <p className="text-xs text-muted-foreground">Renews</p>
            <p className="text-lg font-semibold">{formatDate(data.renewsAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
