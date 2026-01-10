import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Wallet, PlusCircle } from "lucide-react";
import { FREE_MONTHLY_MESSAGES, PRICE_PER_CREDIT_USD } from "@/utiles/constans/wallet";
import { useWallet } from "@/hooks/wallet/useWallet";
import AddCreditPopup from "./AddCreditPopup";
import { useState } from "react";

export default function CreditStatsDemo() {
  const { data, loading, setData } = useWallet();
  const [showAddCredit, setShowAddCredit] = useState(false);

  const totalFreeMonthlyCredits = FREE_MONTHLY_MESSAGES;
  const usedThisMonth = data?.currentMonthUsed ?? 0;

  const remaining = totalFreeMonthlyCredits - usedThisMonth;
  const percentage =
    totalFreeMonthlyCredits > 0
      ? Math.min(100, Math.round((usedThisMonth / totalFreeMonthlyCredits) * 100))
      : 0;

  const isLow = percentage >= 80;

  // In a real app, this would call your backend API
  const handleAddCredits = (credits: number) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            creditBalance: prev.creditBalance + credits,
          }
        : prev
    );
  };
  
  return (
    <>    
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Monthly Usage Card */}
        <Card className="flex-1 p-3">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="text-emerald-600" size={15} />
                Free Messages per Month
              </div>

              <div
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isLow
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {loading ? "..." : `${percentage}%`}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {loading
                    ? "..."
                    : `${usedThisMonth} / ${totalFreeMonthlyCredits} used`}
                </span>
                <span className="text-muted-foreground">
                  {loading ? "..." : `${remaining} remaining`}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isLow ? "bg-red-500" : "bg-emerald-500"
                  }`}
                  style={{ width: loading ? "0%" : `${percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Balance Card */}
        <Card className="flex-1 p-3">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-600" />
                Current Balance
              </div>

              <Button
                size="sm"
                className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => setShowAddCredit(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Add Credits
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="px-4">
            <div className="flex items-end justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-200">
                  {loading ? "..." : data?.creditBalance.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  credits
                </span>
              </div>

              <div className="text-right">
                <span className="block text-xs text-gray-500 dark:text-gray-400">Avg. Cost</span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  ${PRICE_PER_CREDIT_USD} / credit
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Add Credit Popup */}
      <AddCreditPopup
        isOpen={showAddCredit}
        onClose={() => setShowAddCredit(false)}
        onAddCredits={handleAddCredits}
        currentBalance={data?.creditBalance ?? 0}
      />
    </>

  );
}
