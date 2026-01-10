"use client";

import { useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import IconButton from "@/components/common/IconButton";
import { useTransactionHistory } from "@/hooks/wallet/useTransactionHistory";
import { WalletTransactionType, PaymentStatus } from "@/types/WalletTransaction";
import { useSettingsStore } from "@/store/settingsStore";
import { ChevronDown } from "lucide-react";
import { RefreshButton } from "@/components/global/header/Refresh";
import dayjs from "dayjs";

export default function TransactionHistory() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { setSelectedSettingsMenu } = useSettingsStore();

  const handleBack = () => {
    setSelectedSettingsMenu(null);
  };
  const {
    transactions,
    loading,
    loadingMore,
    hasMore,
    totalTransactions,
    filterByType,
    refreshTransactions,
  } = useTransactionHistory({ containerRef });

  const getTransactionLabel = (type: WalletTransactionType, paymentStatus: PaymentStatus) => {
    if (type === WalletTransactionType.CREDIT) {
      return "Credit";
    }
    if (type === WalletTransactionType.REFUND) {
      return "Refund";
    }
    if (type === WalletTransactionType.ADJUSTMENT) {
      return "Adjustment";
    }
    return "Debit";
  };

  const getTypeColor = (type: WalletTransactionType, paymentStatus: PaymentStatus) => {
    if (paymentStatus === PaymentStatus.FAILED) {
      return "text-gray-500 dark:text-gray-400";
    }
    if (paymentStatus === PaymentStatus.PENDING) {
      return "text-yellow-600 dark:text-yellow-500";
    }
    if (type === WalletTransactionType.CREDIT || 
        type === WalletTransactionType.REFUND || 
        type === WalletTransactionType.ADJUSTMENT) {
      return "text-green-600 dark:text-green-500";
    }
    return "text-red-500 dark:text-red-400";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handleBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <h1 className="text-xl font-semibold">
            Transactions{" "}
            <span className="text-gray-500 text-sm">
              ({totalTransactions})
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refreshTransactions} />
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pb-3 flex items-center gap-3 border-b border-gray-200 dark:border-[#2A2A2A]">
        {/* Type Filter */}
        <div className="relative">
          <select
            className="px-3 py-2 pr-10 rounded-md bg-gray-100 dark:bg-[#1E1F1F]
                      appearance-none w-full"
            onChange={(e) =>
              filterByType(e.target.value as WalletTransactionType | "")
            }
          >
            <option value="">All Types</option>
            <option value={WalletTransactionType.CREDIT}>Credit</option>
            <option value={WalletTransactionType.DEBIT}>Debit</option>
            <option value={WalletTransactionType.REFUND}>Refund</option>
            <option value={WalletTransactionType.ADJUSTMENT}>Adjustment</option>
          </select>

          {/* Arrow */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <ChevronDown />
          </span>
        </div>
      </div>

      {/* Transaction List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto mt-3"
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions found.
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={`${tx._id}`}
              className="mx-3 mb-2 p-3 rounded-lg border border-gray-200 dark:border-[#2A2A2A] 
                       bg-white dark:bg-[#141414] hover:bg-gray-50 dark:hover:bg-[#1A1A1A] 
                       transition-colors duration-150 min-h-[72px]"
            >
              <div className="flex items-start justify-between gap-2">
                {/* Left side: Transaction info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {getTransactionLabel(tx.type, tx.paymentStatus)}
                    </p>
                    {tx.paymentStatus === PaymentStatus.SUCCESS && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 
                                     text-green-800 dark:text-green-300 rounded-full">
                        Success
                      </span>
                    )}
                    {tx.paymentStatus === PaymentStatus.PROCESSING && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 
                                     text-yellow-800 dark:text-yellow-300 rounded-full">
                        Processing
                      </span>
                    )}
                    {tx.paymentStatus === PaymentStatus.PENDING && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 
                                     text-yellow-800 dark:text-yellow-300 rounded-full">
                        Pending
                      </span>
                    )}
                    {tx.paymentStatus === PaymentStatus.FAILED && (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 
                                     text-red-800 dark:text-red-300 rounded-full">
                        Failed
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p className="whitespace-nowrap">
                      {dayjs(tx.createdAt).format("DD MMM, hh:mm A")}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {(tx.orderId || tx.paymentId) && (
                      <span className="truncate overflow-hidden">
                        {[
                          tx.orderId && `Order ID: ${tx.orderId}`,
                          tx.paymentId && `Payment ID: ${tx.paymentId}`,
                        ]
                          .filter(Boolean)
                          .join(' • ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side: Amount and credits */}
                <div className="text-right">
                  {/* Credits (Primary) */}
                  <p className={`font-semibold text-sm`}>
                    {tx.credits} credits
                  </p>
                  
                  {/* Amount (Secondary) */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tx.amount} {tx.currency}
                  </p>
                  
                  {/* Balance */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Credits: {tx.creditsBefore} → {tx.creditsAfter}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading more */}
        {hasMore &&
          loadingMore &&
          Array.from({ length: 2 }).map((_, i) => (
            <TransactionSkeleton key={`more-${i}`} />
          ))}
      </div>
    </div>
  );
}

/* ---------------------------------- */
/* Skeleton Row */
/* ---------------------------------- */

function TransactionSkeleton() {
  return (
    <div className="mx-3 mb-2 p-3 rounded-lg border border-gray-200 dark:border-[#2A2A2A] min-h-[72px]">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-3 w-12 ml-auto" />
          <Skeleton className="h-3 w-14 ml-auto" />
        </div>
      </div>
    </div>
  );
}