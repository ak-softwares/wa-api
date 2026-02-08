"use client";

import { useMemo, useRef } from "react";
import * as XLSX from "xlsx";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import IconButton from "@/components/common/IconButton";
import { MetricCard, MetricCardSkeleton } from "../analytics/AnalyticsCard";

import { CheckCircle, Eye, Loader2, MessageSquare, Truck } from "lucide-react";
import { calcPercentage } from "@/lib/helper/math";
import Image from "next/image";

import { useBroadcastMessageReport } from "@/hooks/broadcast/useBroadcastMessageReport";
import { MessageStatus } from "@/types/MessageType";
import SearchBar from "@/components/common/SearchBar";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { formatFullDateTime } from "@/utiles/formatTime/formatTime";
import { useBroadcastReportExcel } from "@/hooks/broadcast/useBroadcastReportExcel";

type Props = {
  onBack?: () => void;
  chatId: string;
  messageId: string;
};

function StatusBadge({ value }: { value?: MessageStatus }) {
  const base =
    "px-2 py-1 rounded-full text-xs font-medium border inline-flex items-center";

  if (value === MessageStatus.Read)
    return (
      <span
        className={`${base} border-green-300 text-green-700 bg-green-50 dark:border-green-500/40 dark:text-green-300 dark:bg-green-500/10`}
      >
        Seen
      </span>
    );

  if (value === MessageStatus.Delivered)
    return (
      <span
        className={`${base} border-yellow-400 text-yellow-800 bg-yellow-50 dark:border-yellow-500/40 dark:text-yellow-300 dark:bg-yellow-500/10`}
      >
        Delivered
      </span>
    );

  if (value === MessageStatus.Sent)
    return (
      <span
        className={`${base} border-yellow-300 text-yellow-700 bg-yellow-50 dark:border-yellow-500/30 dark:text-yellow-200 dark:bg-yellow-500/10`}
      >
        Sent
      </span>
    );

  if (value === MessageStatus.Failed)
    return (
      <span
        className={`${base} border-red-300 text-red-700 bg-red-50 dark:border-red-500/40 dark:text-red-300 dark:bg-red-500/10`}
      >
        Failed
      </span>
    );

  return (
    <span
      className={`${base} border-gray-300 text-gray-700 bg-gray-50 dark:border-gray-500/40 dark:text-gray-300 dark:bg-gray-500/10`}
    >
      -
    </span>
  );
}

export default function BroadcastMessageReportPage({
  onBack,
  chatId,
  messageId,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { rows, summary, loading, loadingMore, hasMore, search, setSearch, refreshReport } 
  = useBroadcastMessageReport({
    containerRef,
    chatId,
    messageId,
  });
  const { downloading, downloadExcel } = useBroadcastReportExcel();

  const hadelDownloadExcel = async () => {
    await downloadExcel({ chatId, messageId })
  };

  const handelOnBack = () => {
    if (onBack) {
      onBack();
      return;
    }
  };

  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handelOnBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />

          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">Broadcast Message Report</h1>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant={"outline"} onClick={refreshReport}>
            Refresh
          </Button>

          <Button variant={"outline"} onClick={hadelDownloadExcel} disabled={downloading}>
            {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Image
                    src="/assets/icons/download.svg"
                    alt="Download"
                    width={18}
                    height={18}
                    className="dark:invert"
                  />
                  Download Excel
                </>
              )}
          </Button>
        </div>
      </div>



      {/* METRICS */}
      <div className="px-5 py-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 shrink-0">
        {loading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : (
          <>
            <MetricCard
              label="Total Messages"
              value={summary?.totalMessages ?? 0}
              icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            />

            <MetricCard
              label="FB Accepted"
              value={loading ? "..." : summary?.fbAcceptedMessages ?? 0}
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
              subValue={calcPercentage({
                total: summary?.totalMessages ?? 0,
                part: summary?.fbAcceptedMessages ?? 0,
              })}
            />

            <MetricCard
              label="Delivered"
              value={loading ? "..." : summary?.deliveredMessages ?? 0}
              icon={<Truck className="h-4 w-4 text-muted-foreground" />}
              subValue={calcPercentage({
                total: summary?.totalMessages ?? 0,
                part: summary?.deliveredMessages ?? 0,
              })}
            />

            <MetricCard
              label="Read"
              value={loading ? "..." : summary?.readMessages ?? 0}
              icon={<Eye className="h-4 w-4 text-muted-foreground" />}
              subValue={calcPercentage({
                total: summary?.totalMessages ?? 0,
                part: summary?.readMessages ?? 0,
              })}
            />
          </>
        )}
      </div>

      {/* SEARCH */}
      <div className="px-5 py-2 shrink-0">
        <SearchBar
          value={search}
          placeholder="Search number..."
          onSearch={(q) => setSearch(q)}
        />
        {/* <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number..."
          className="max-w-md"
        /> */}
      </div>

      {/* TABLE */}
      <div className="flex-1 px-5 py-2 flex flex-col min-h-0">
        <div className="w-full border rounded-xl overflow-hidden dark:border-[#333434] flex flex-col flex-1 min-h-0">

          {/* Scroll only body */}
          <div ref={containerRef} className="flex-1 overflow-auto min-h-0">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-[#111]">
                <tr className="text-left">
                  <th className="p-3 border-b dark:border-[#333434]">#</th>
                  <th className="p-3 border-b dark:border-[#333434]">Number</th>
                  <th className="p-3 border-b dark:border-[#333434]">Status</th>
                  <th className="p-3 border-b dark:border-[#333434]">
                    Delivered At
                  </th>
                  <th className="p-3 border-b dark:border-[#333434]">Read At</th>
                  <th className="p-3 border-b dark:border-[#333434]">Error</th>
                </tr>
              </thead>

              <tbody>
                {loading && rows.length === 0 ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={10} className="p-3 border-b dark:border-[#333434]">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-5 text-center text-gray-500 dark:text-gray-400"
                    >
                      No report data found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr
                      key={row._id}
                      className="hover:bg-gray-50 dark:hover:bg-[#151515] transition"
                    >
                      <td className="p-3 border-b dark:border-[#333434]">
                        {index + 1}
                      </td>

                      <td className="p-3 border-b dark:border-[#333434]">
                        {formatPhone(row.to) || "-"}
                      </td>

                      <td className="p-3 border-b dark:border-[#333434]">
                        <StatusBadge value={row.status} />
                      </td>

                      <td className="p-3 border-b dark:border-[#333434]">
                        {formatFullDateTime(row.deliveredAt) || "-"}
                      </td>

                      <td className="p-3 border-b dark:border-[#333434]">
                        {formatFullDateTime(row.readAt) || "-"}
                      </td>

                      <td className="p-3 border-b dark:border-[#333434]">
                        {row.errorMessage ? (
                          <span
                            title={row.errorMessage}
                            className="text-orange-600 max-w-[130px] inline-block overflow-hidden text-ellipsis break-words"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {row.errorMessage}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}

                {/* Pagination Loader */}
                {loadingMore && (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading more...
                    </td>
                  </tr>
                )}

                {!loadingMore && !hasMore && rows.length > 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="p-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      End of report
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

