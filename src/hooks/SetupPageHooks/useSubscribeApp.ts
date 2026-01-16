"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

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
        toast.success(data.message);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while subscribing app");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    subscribeAppToWABA,
  };
}
