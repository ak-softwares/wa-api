"use client";

import { useRef } from "react";
import IconButton from "@/components/common/IconButton";
import { RefreshButton } from "@/components/global/header/Refresh";
import { usePaymentHistory } from "@/hooks/subscription/usePaymentHistory";
import { useSettingsStore } from "@/store/settingsStore";

import {
  InvoiceRow,
  PaymentSkeleton,
} from "./PaymentHistoryCommon";

export default function PaymentHistoryPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { setSelectedSettingsMenu } = useSettingsStore();

  const handleBack = () => {
    setSelectedSettingsMenu(null);
  };

  const {
    paymentHistory,
    loading,
    loadingMore,
    hasMore,
    totalRecords,
    refreshPaymentHistory,
  } = usePaymentHistory({ containerRef });

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />

          <h1 className="text-xl font-semibold">
            Payment History{" "}
            <span className="text-sm text-gray-500">
              ({totalRecords})
            </span>
          </h1>
        </div>

        <RefreshButton onClick={refreshPaymentHistory} />
      </div>

      {/* List */}
      <div
        ref={containerRef}
        className="mt-3 flex-1 overflow-y-auto"
      >
        {loading ? (
          <div className="mx-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <PaymentSkeleton key={i} />
            ))}
          </div>
        ) : paymentHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No payment records found.
          </div>
        ) : (
          <>
            {paymentHistory.map((payment) => (
              <InvoiceRow
                key={payment._id ?? payment.subscriptionId}
                payment={payment}
                className="mx-3"
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