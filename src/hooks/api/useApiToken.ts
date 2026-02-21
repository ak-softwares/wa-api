"use client";

import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { ApiToken } from "@/types/ApiToken";

export function useApiToken(autoLoad: boolean = true) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiToken, setApiToken] = useState<ApiToken | null>(null);

  // GET
  const loadApiToken = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/api-token");
      if (!res.ok) throw new Error("Failed to load API token");

      const { data } = await res.json();
      // ✅ only object or null
      setApiToken(data?.token ?? null);

      return data?.token ?? null;
    } catch (error: any) {
      // toast.error(error?.message || "Failed to load API token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // POST
  const generateNewToken = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/api-token", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate token");

      const { data } = await res.json();

      showToast.success("New API token generated!");

      // update metadata immediately
      setApiToken(data?.token ?? null);

      return data?.token?.token ?? ""; // raw token
    } catch (error: any) {
      showToast.error(error?.message || "Failed to generate token");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // DELETE
  const revokeToken = useCallback(async (tokenId: string) => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/api-token/${tokenId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to revoke token");

      showToast.success("API token revoked");

      setApiToken(null);

      return true;
    } catch (error: any) {
      showToast.error(error?.message || "Failed to revoke token");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    showToast.success("Copied to clipboard");
  }, []);

  useEffect(() => {
    if (autoLoad) loadApiToken();
  }, [autoLoad, loadApiToken]);

  return {
    isLoading,
    apiToken,
    loadApiToken,
    generateNewToken,
    revokeToken,
    copyToClipboard,
  };
}
