'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

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
            <Link 
            href="https://play.google.com/store/apps/details?id=com.ara.chatflow" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-3 rounded-2xl transition border border-border bg-background  text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
            <img 
                src="/assets/logos/google-play-logo.png" 
                alt="Get it on Google Play" 
                className="h-6 mr-2"
            />
            Get it on Google Play
            </Link>
        </CardContent>
        </Card>

    </div>
  );
}
