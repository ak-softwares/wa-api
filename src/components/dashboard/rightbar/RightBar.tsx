'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { WhatsappAPIPricingCard } from "./widgets/whatsappAPIPricing";
import { Zap } from "lucide-react";
import { useWallet } from "@/hooks/wallet/useWallet";
import { useState } from "react";
import { FREE_MONTHLY_MESSAGES } from "@/utiles/constans/wallet";
import { Badge } from "@/components/ui/badge";

export default function RightBar() {
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
  return (
    <div className="grid grid-cols gap-6">
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle>Download from Play Store</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-3">
          {/* QR Code Image */}
          <img 
            src="/assets/qr_code/qr-code.png" 
            alt="QR Code - Download App" 
            className="w-32 h-32"
          />
            
          {/* Caption */}
          <p className="text-sm text-gray-500 text-center">
            Scan the QR code to download our app from the Play Store.
          </p>

          {/* Play Store Button */}
          <Button
            variant={"outline"}
            className="w-full"
            onClick={() =>
              window.open(
                "https://play.google.com/store/apps/details?id=com.ara.chatflow",
                "_blank"
              )
            }
            >
            <img 
              src="/assets/logos/google-play-logo.png" 
              alt="Get it on Google Play" 
              className="h-5 mr-2"
            />
            Get it on Google Play
          </Button>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader className="">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2 font-semibold">
              <Zap className="text-[#0B8576] dark:text-[#11B8A2]" size={16} />
              {FREE_MONTHLY_MESSAGES} Free Message/Month
            </div>

            <Badge
              variant={isLow ? "destructive" : "outline"}
              className="text-xs"
            >
              {loading ? "..." : `${percentage}%`}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {loading
                ? "..."
                : `${usedThisMonth} / ${totalFreeMonthlyCredits}`}
            </span>

            <span className="text-muted-foreground">
              {loading ? "..." : `${remaining} left`}
            </span>
          </div>

          <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                isLow
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-emerald-500 to-emerald-600"
              }`}
              style={{ width: loading ? "0%" : `${percentage}%` }}
            />
          </div>

          {!isLow && !loading && (
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2 text-xs"
              // onClick={() => router.push("/billing")}
            >
              Upgrade Plan
            </Button>
          )}
        </CardContent>
      </Card> */}

      <Card>
        <CardTitle className="items-center text-center">Need Help?</CardTitle>
        <CardContent className="flex flex-col items-center space-y-4">
          {/* Caption */}
          <p className="text-sm text-gray-500 text-center">
            Need help? Chat with our support team on WhatsApp.
          </p>

          {/* WhatsApp Button */}
          <Button
            variant={"outline"}
            className="w-full"
            onClick={() =>
              window.open(
                "https://wa.me/918077030731?text=Hi%20I%20need%20support%20regarding%20WA-API", 
                "_blank"
              )
            }
          >
          Chat on WhatsApp
          </Button>
        </CardContent>
      </Card>

      <div className="max-w-md">
        <WhatsappAPIPricingCard />        
      </div>
    </div>
  );
}
