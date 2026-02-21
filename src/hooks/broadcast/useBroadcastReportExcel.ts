"use client";

import { showToast } from "@/components/ui/sonner";
import { useState } from "react";

type Props = {
  chatId: string;
  messageId: string;
};

export function useBroadcastReportExcel() {
  const [downloading, setDownloading] = useState(false);

  const downloadExcel = async ({ chatId, messageId }: Props) => {
    if (!chatId || !messageId) {
      showToast.error("chatId and messageId are required");
      return;
    }

    try {
      setDownloading(true);

      const res = await fetch(
        `/api/wa-accounts/chats/broadcast/report/excel?chatId=${chatId}&messageId=${messageId}`,
        { method: "GET" }
      );

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || "Failed to download report");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `broadcast-report-${chatId}.xlsx`;
      a.click();

      window.URL.revokeObjectURL(url);

      showToast.success("Excel downloaded");
    } catch (err: any) {
      showToast.error(err.message || "Excel download failed");
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, downloadExcel };
}
