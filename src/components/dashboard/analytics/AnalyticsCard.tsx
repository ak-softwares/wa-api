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
import { BarChart } from "lucide-react";
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
  // 🔹 Fetch default (This Month)
  // -------------------------------
  useEffect(() => {
    const { start, end } = dateRanges[DateRangeEnum.THIS_MONTH]();
    fetchAnalytics({ start, end });
  }, []);

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
          <BarChart className="h-4 w-4 text-blue-500" />
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

          <SelectContent className="dark:bg-[#161717]">
            {Object.values(DateRangeEnum).map((range) => (
              <SelectItem key={range} value={range} className="dark:hover:bg-[#222222]">
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
          />
          <MetricCard
            label="Sent"
            value={loading ? "..." : data?.totalSentMessages ?? 0}
          />
          <MetricCard
            label="AI Replies"
            value={loading ? "..." : data?.totalAIReplies ?? 0}
          />
          <MetricCard
            label="AI Cost ($)"
            value={loading ? "..." : (data?.totalAICost ?? 0).toFixed(4)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="p-3 border rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
