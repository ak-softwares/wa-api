"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { showToast } from "@/components/ui/sonner";

export function useSubscribeApp() {
  const [isLoading, setIsLoading] = useState(false);

  // ⚡ Subscribe app to WABA
  const subscribeAppToWABA = async (onSuccess?: () => void) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/facebook/subscribe-app", {
        method: "POST",
      });
      const data: ApiResponse = await res.json();
      if (data.success) {
        showToast.success(data.message);
        if (onSuccess) onSuccess();
      } else {
        showToast.error(data.message);
      }
    } catch (error) {
      showToast.error("Something went wrong while subscribing app");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    subscribeAppToWABA,
  };
}
