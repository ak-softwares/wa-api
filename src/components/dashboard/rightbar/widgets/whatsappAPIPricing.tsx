"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Facebook, AlertCircle, ExternalLink } from "lucide-react";

export function WhatsappAPIPricingCard() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Facebook className="h-5 w-5 text-blue-500 flex-shrink-0" />
        <div>
          <CardTitle className="text-sm font-medium">WhatsApp API Pricing</CardTitle>
          <CardDescription className="text-xs">
            Official WhatsApp Business API info
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="p-2 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">
                Important Notice
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Facebook’s pricing applies to business conversations
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link
            href="https://business.whatsapp.com/products/platform-pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Facebook Official Pricing
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
