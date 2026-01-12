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
import { BarChart, CheckCircle, CreditCard, DollarSign, Eye, Lock, MessageSquare, Send, Sparkles, TrendingUp, Truck, Wallet } from "lucide-react";
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Total Messages */}
          <MetricCard
            label="Total Messages"
            value={loading ? "..." : data?.totalMessages ?? 0}
            icon={<MessageSquare className="h-4 w-4 text-blue-500" />}
          />

          {/* API Sent (wamid received) */}
          <MetricCard
            label="API Sent"
            value={loading ? "..." : data?.apiSentMessages ?? 0}
            icon={<Send className="h-4 w-4 text-green-500" />}
          />

          {/* FB Accepted (webhook sent) */}
          <MetricCard
            label="FB Accepted"
            value={loading ? "..." : data?.fbAcceptedMessages ?? 0}
            icon={<CheckCircle className="h-4 w-4 text-cyan-500" />}
          />

          {/* Delivered */}
          <MetricCard
            label="Delivered"
            value={loading ? "..." : data?.deliveredMessages ?? 0}
            icon={<Truck className="h-4 w-4 text-indigo-500" />}
          />

          {/* Read */}
          <MetricCard
            label="Read"
            value={loading ? "..." : data?.readMessages ?? 0}
            icon={<Eye className="h-4 w-4 text-emerald-500" />}
          />

          {/* Credit Spend */}
          {/* <MetricCard
            label="Credit Spend"
            value={loading ? "..." : (data?.creditSpend ?? 0).toFixed(2)}
            icon={<CreditCard className="h-4 w-4 text-rose-500" />}
          /> */}

          {/* AI Replies */}
          <MetricCard
            label="AI Replies"
            value={loading ? "..." : data?.aIReplies ?? 0}
            icon={<Sparkles className="h-4 w-4 text-amber-500" />}
          />

          {/* AI Cost */}
          {/* <MetricCard
            label="AI Cost ($)"
            value={loading ? "..." : (data?.aICost ?? 0).toFixed(4)}
            icon={<DollarSign className="h-4 w-4 text-purple-500" />}
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
