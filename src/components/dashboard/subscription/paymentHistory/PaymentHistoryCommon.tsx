"use client";

import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentHistory, PaymentStatus } from "@/types/PaymentHistory";

const CURRENCY_SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export const STATUS_BADGE: Record<
  PaymentStatus,
  { badge: string; dot: string }
> = {
  [PaymentStatus.PAID]: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  [PaymentStatus.COMPLETED]: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  [PaymentStatus.ACTIVE]: {
    badge:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  [PaymentStatus.AUTHENTICATED]: {
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  [PaymentStatus.PENDING]: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  [PaymentStatus.HALTED]: {
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  [PaymentStatus.CANCELLED]: {
    badge:
      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  [PaymentStatus.FAILED]: {
    badge:
      "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
    dot: "bg-red-500",
  },
};

function currencySymbol(currency: string) {
  return CURRENCY_SYMBOL[currency] ?? currency;
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat(
    currency === "INR" ? "en-IN" : "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount / 100);
}

function getPlanLabel(
  tier: PaymentHistory["tier"],
  billing: PaymentHistory["billing"]
) {
  const tierLabel = tier === "STARTER" ? "Starter" : "Growth";
  const billingLabel =
    billing === "MONTHLY" ? "Monthly" : "Yearly";

  return `${tierLabel} · ${billingLabel}`;
}

interface InvoiceRowProps {
  payment: PaymentHistory;
  className?: string;
}

export function InvoiceRow({
  payment,
  className = "",
}: InvoiceRowProps) {
  const sym = currencySymbol(payment.currency);

  const { badge, dot } = STATUS_BADGE[payment.status];

  const planLabel = getPlanLabel(
    payment.tier,
    payment.billing
  );

  const dateLabel = payment.createdAt
    ? dayjs(payment.createdAt).format(
        "DD MMM YYYY, hh:mm A"
      )
    : "—";

  return (
    <div
      className={`mb-2 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3.5 transition-colors duration-150 hover:bg-gray-50 dark:border-[#2A2A2A] dark:bg-[#141414] dark:hover:bg-[#1A1A1A] ${className}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-base dark:bg-white/10">
          🧾
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {planLabel}
          </p>

          <p className="mt-0.5 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
            {dateLabel}
          </p>

          {payment.shortUrl &&
            [
              PaymentStatus.PENDING,
              PaymentStatus.HALTED,
              PaymentStatus.FAILED,
            ].includes(payment.status) && (
              <a
                href={payment.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-block text-xs text-blue-500 hover:underline dark:text-blue-400"
              >
                Complete payment ↗
              </a>
            )}
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3">
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {payment.status}
        </span>

        <p className="tabular-nums text-sm font-bold text-gray-900 dark:text-white">
          {sym}
          {formatAmount(payment.price, payment.currency)}
        </p>
      </div>
    </div>
  );
}

export function PaymentSkeleton() {
  return (
    <div className="mb-2 flex min-h-[68px] items-center justify-between rounded-xl border border-gray-200 px-4 py-3.5 dark:border-[#2A2A2A]">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />

        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}