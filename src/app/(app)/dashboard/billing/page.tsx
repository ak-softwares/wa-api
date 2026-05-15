"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, ChevronRight } from "lucide-react";
import { useRazorpaySubscription } from "@/hooks/razorpay/useRazorpaySubscription";
import CurrentSubscriptionCard from "@/components/dashboard/subscription/CurrentSubscriptionCard";
import ChangePlanSection from "@/components/dashboard/subscription/Changeplansection";
import PaymentHistorySection from "@/components/dashboard/subscription/paymentHistory/PaymentHistorySection";
import { SubscriptionUsageProvider } from "@/context/subscription/SubscriptionUsageContext";

// ── Toast helper type ─────────────────────────────────────────────────────────

type Toast = { type: "success" | "error"; msg: string };

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SubscriptionUsageProvider>
      <div className="min-h-screen bg-[#f8f9fb] font-sans text-gray-900 dark:bg-[#0d0d0f] dark:text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">

          {/* ── Page header ── */}
          <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white dark:border-white/10 dark:bg-white/[0.03]">

            {/* Breadcrumb strip */}
            <div className="flex items-center gap-1.5 border-b border-[#e5e7eb] px-6 py-3 dark:border-white/10">
              <Link
                href="/dashboard"
                className="text-xs text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
              >
                Dashboard
              </Link>
              <ChevronRight className="h-3 w-3 text-gray-300 dark:text-white/20" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Billing
              </span>
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between gap-4 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-gray-900 dark:text-white">
                    Billing &amp; Subscription
                  </h1>
                  <p className="text-xs text-gray-400">
                    Manage your plan, payment method, and invoice history
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 1. Current subscription ── */}
          <CurrentSubscriptionCard bgClass="bg-white dark:bg-white/[0.03]"/>

          {/* ── 2. Change plan ── */}
          <ChangePlanSection />

          {/* ── 3. Payment history ── */}
          <PaymentHistorySection />

        </div>
      </div>
    </SubscriptionUsageProvider>
  );
}