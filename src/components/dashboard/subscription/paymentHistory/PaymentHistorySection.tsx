"use client";

import { useRef } from "react";

import { RefreshButton } from "@/components/global/header/Refresh";
import { usePaymentHistory } from "@/hooks/subscription/usePaymentHistory";

import {
  InvoiceRow,
  PaymentSkeleton,
} from "./PaymentHistoryCommon";

export default function PaymentHistorySection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    paymentHistory,
    loading,
    loadingMore,
    hasMore,
    totalRecords,
    refreshPaymentHistory,
  } = usePaymentHistory({ containerRef });

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold">
            Payment History{" "}
            {!loading && (
              <span className="text-sm font-normal text-gray-500">
                ({totalRecords})
              </span>
            )}
          </h2>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your past payments and receipts.
          </p>
        </div>

        <RefreshButton onClick={refreshPaymentHistory} />
      </div>

      {/* Scrollable list */}
      <div
        ref={containerRef}
        className="max-h-[480px] overflow-y-auto rounded-2xl"
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <PaymentSkeleton key={i} />
          ))
        ) : paymentHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white py-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <p className="text-3xl">🧾</p>

            <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-white">
              No payment records found.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Your payment receipts will appear here once you
              upgrade.
            </p>
          </div>
        ) : (
          <>
            {paymentHistory.map((payment) => (
              <InvoiceRow
                key={payment._id ?? payment.subscriptionId}
                payment={payment}
              />
            ))}

            {/* Infinite scroll loader */}
            {hasMore &&
              loadingMore &&
              Array.from({ length: 2 }).map((_, i) => (
                <PaymentSkeleton key={`more-${i}`} />
              ))}
          </>
        )}
      </div>
    </div>
  );
}