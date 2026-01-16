'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { WhatsappAPIPricingCard } from "./widgets/whatsappAPIPricing";

export default function RightBar() {

  return (
    <div>
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
        <div className="max-w-md mx-auto mt-6">
          <WhatsappAPIPricingCard />        
        </div>
    </div>
  );
}
