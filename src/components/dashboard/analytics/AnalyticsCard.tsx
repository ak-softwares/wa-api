"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BarChart, CreditCard, DollarSign, Lock, MessageSquare, Send, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useAnalytics } from "@/hooks/analytics/useAnalytics";

import { dateRanges } from "@/utiles/helper/dateRangePresetsHelper";
import { DateRangeEnum, DateRangeLabels } from "@/utiles/enums/dateRangeEnum";

export default function AnalyticsCard() {
  const { data, loading, fetchAnalytics } = useAnalytics();

  const [selectedRange, setSelectedRange] = useState<DateRangeEnum>(
    DateRangeEnum.THIS_MONTH
  );

  // -------------------------------
  // 🔹 When dropdown changes
  // -------------------------------
  const handleRangeChange = (value: DateRangeEnum) => {
    setSelectedRange(value);

    const { start, end } = dateRanges[value]();
    fetchAnalytics({ start, end });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart className="h-4 w-4 text-emerald-500" />
          Analytics
        </CardTitle>
        <CardDescription className="text-sm">
          Overview of your messaging & AI usage
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Filter */}
        <Select value={selectedRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>

          <SelectContent>
            {Object.values(DateRangeEnum).map((range) => (
              <SelectItem key={range} value={range}>
                {DateRangeLabels[range]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard
            label="Total Messages"
            value={loading ? "..." : data?.totalMessages ?? 0}
            icon={<MessageSquare className="h-4 w-4 text-blue-500" />}// CreditCard
            // trend={demoAnalytics.creditsSpentTrend}
          />
          <MetricCard
            label="Sent"
            value={loading ? "..." : data?.totalSentMessages ?? 0}
            icon={<Send className="h-4 w-4 text-green-500" />}
            // trend={demoAnalytics.creditsAddedTrend}
          />
          <MetricCard
            label="AI Cost ($)"
            value={loading ? "..." : (data?.totalAICost ?? 0).toFixed(4)}
            icon={<DollarSign className="h-4 w-4 text-purple-500" />}
          />
          <MetricCard
            label="AI Replies"
            value={loading ? "..." : data?.totalAIReplies ?? 0}
            icon={<Sparkles className="h-4 w-4 text-amber-500" />}
          />
          {/* <MetricCard
            label="Credit Spend"
            value={loading ? "..." : data?.totalAIReplies ?? 0}
            icon={<CreditCard className="h-4 w-4 text-amber-500" />}
          /> */}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: any;
  icon?: React.ReactNode;
  trend?: number;
}) {
  return (
    <div className="p-3 border rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-xl font-bold">{value}</p>
        {trend !== undefined && (
          <span
            className={`text-xs ${
              trend >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}
