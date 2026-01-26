"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function APITokenSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1b1b] p-4 rounded-xl shadow-sm border border-gray-200 dark:border-[#2a2b2b]">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Token Label */}
      <Skeleton className="h-4 w-28 mb-3" />

      {/* Token Input + Buttons */}
      <div className="flex gap-2 mb-5">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>

      {/* Generate Button */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
