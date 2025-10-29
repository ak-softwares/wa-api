"use client";

import { useState, useEffect } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";

export function useSubscribeApp() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAppSubscribed, setIsAppSubscribed] = useState<boolean | null>(null);

  // 🔍 Check if app is already subscribed to WABA
  const checkSubscription = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/whatsapp/subscribe-app"); // ✅ new endpoint for subscription status
      const data: ApiResponse & { isSubscribed?: boolean } = await res.json();

      if (res.ok && data.success) {
        setIsAppSubscribed(data.isSubscribed ?? false);
      } else {
        setIsAppSubscribed(false);
      }
    } catch (error) {
      setIsAppSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  // ⚡ Subscribe app to WABA
  const subscribeAppToWABA = async (onSuccess?: () => void) => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/whatsapp/subscribe-app", {
        method: "POST",
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success(data.message);
        setIsAppSubscribed(true);
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

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    isLoading,
    isAppSubscribed,
    subscribeAppToWABA,
    refreshStatus: checkSubscription,
  };
}
