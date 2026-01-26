'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function AIChatSkeleton() {
  return (
    <div className="flex flex-1">
      {/* Main */}
      <div className="flex-2 flex flex-col px-6">
        <div className="max-w-4xl mx-auto w-full">
          {/* Label */}
          <Skeleton className="h-4 w-28 mb-3" />

          {/* Textarea Skeleton */}
          <Skeleton className="h-[320px] w-full rounded-lg" />

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-6">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-72" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-60" />
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-1 flex-col px-4">
        {/* Preview */}
        <div className="mt-8 p-4 rounded-lg border border-gray-200 dark:border-[#3a3b3b]">
          <Skeleton className="h-4 w-20 mb-4" />

          <div className="space-y-3">
            <div className="flex justify-start">
              <Skeleton className="h-16 w-[240px] rounded-lg" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-16 w-[240px] rounded-lg" />
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="py-4">
          <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-[#3a3b3b]">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
