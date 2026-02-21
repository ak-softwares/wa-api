'use client';

import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { AIChat } from "@/types/Ai";

export function useUpdateAiChat(getPayload?: () => Partial<AIChat>) {
  const [isSaving, setIsSaving] = useState(false);

  const updateAIChatConfig = useCallback(async (data: Partial<AIChat>) => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/wa-accounts/ai/ai-chat", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update AI Chat config");

      const updated = await response.json();
      showToast.success("AI Chat updated successfully!");

      return updated.data ?? updated;
    } catch (error: any) {
      showToast.error(`Error updating AI Chat: ${error?.message || error}`);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ✅ Ctrl+S / Cmd+S
  useEffect(() => {
    if (!getPayload) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const isSaveShortcut =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";

      if (!isSaveShortcut) return;

      e.preventDefault();
      if (isSaving) return;

      const payload = getPayload();
      updateAIChatConfig(payload);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getPayload, updateAIChatConfig, isSaving]);

  return {
    isSaving,
    updateAIChatConfig,
  };
}
