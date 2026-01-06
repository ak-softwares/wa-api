import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Wallet, PlusCircle } from "lucide-react";
import { FREE_MONTHLY_MESSAGES, PRICE_PER_MESSAGE } from "@/utiles/constans/wallet";
import { useWallet } from "@/hooks/wallet/useWallet";
import AddCreditPopup from "./AddCreditPopup";
import { useState } from "react";

export default function CreditStatsDemo() {
  const { data, loading } = useWallet();
  const [showAddCredit, setShowAddCredit] = useState(false);


  const totalFreeMonthlyCredits = FREE_MONTHLY_MESSAGES;
  const usedThisMonth = data?.currentMonthUsed ?? 0;

  const remaining = totalFreeMonthlyCredits - usedThisMonth;
  const percentage =
    totalFreeMonthlyCredits > 0
      ? Math.min(100, Math.round((usedThisMonth / totalFreeMonthlyCredits) * 100))
      : 0;

  const isLow = percentage >= 80;

  // Mock function to simulate adding credits
  // In a real app, this would call your backend API
  const handleAddCredits = async (credits: number) => {
    try {
      // Example API call:
      // await fetch('/api/wallet/add-credits', {
      //   method: 'POST',
      //   body: JSON.stringify({ credits }),
      // });
      
      // For demo purposes, just refetch the wallet data
      console.log(`Adding ${credits} credits`);
      // refetch(); // This will refetch the wallet data
    } catch (error) {
      console.error("Failed to add credits:", error);
    }
  };
  return (
    <>    
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Monthly Usage Card */}
        <Card className="flex-1">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Free messages / Month
                </span>
              </div>

              <div
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  isLow
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {loading ? "..." : `${percentage}%`}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {loading
                    ? "..."
                    : `${usedThisMonth} / ${totalFreeMonthlyCredits} used`}
                </span>
                <span className="text-gray-500">
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
        <Card className="flex-1">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Current Balance
                </span>
              </div>

              <Button
                size="sm"
                className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                onClick={() => setShowAddCredit(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Add Credits
              </Button>
            </div>

            <div className="flex items-end gap-3 mt-2">
              <div className="flex flex-1 items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {loading ? "..." : data?.creditBalance.toLocaleString()}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  credits
                </span>
              </div>

              <div className="text-right">
                <span className="block text-xs text-gray-500">Avg. Cost</span>
                <p className="text-sm font-medium text-gray-900">
                  ${PRICE_PER_MESSAGE} / credit
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
