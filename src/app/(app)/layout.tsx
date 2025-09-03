
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/header/header";
import Footer from "@/components/ui/footer/footer";
import Providers from "@/components/providers/providers";
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/providers/theme-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WA API",
  description: "Manage and integrate WhatsApp Business API for messaging and automation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </Providers>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
