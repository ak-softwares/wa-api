"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";

export function useApiToken(autoLoad: boolean = true) {
  const [apiToken, setApiToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ GET token
  const loadApiToken = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/wa-accounts/api-token");
      if (!res.ok) throw new Error("Failed to load API token");

      const { data } = await res.json();
      setApiToken(data?.token || "");

      return data?.token || "";
    } catch (error: any) {
      toast.error(error?.message || "Failed to load API token");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ POST generate token
  const generateNewToken = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/wa-accounts/api-token", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate token");

      const { data } = await res.json();
      setApiToken(data?.token || "");

      toast.success("New API token generated!");
      return data?.token || "";
    } catch (error: any) {
      toast.error(error?.message || "Failed to generate token");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ DELETE revoke token
  const revokeToken = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/wa-accounts/api-token", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke token");

      setApiToken("");
      toast.success("API token revoked");
      return true;
    } catch (error: any) {
      toast.error(error?.message || "Failed to revoke token");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ copy helper
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }, []);

  useEffect(() => {
    if (autoLoad) loadApiToken();
  }, [autoLoad, loadApiToken]);

  return {
    apiToken,
    setApiToken,
    isLoading,

    loadApiToken,
    generateNewToken,
    revokeToken,
    copyToClipboard,
  };
}
