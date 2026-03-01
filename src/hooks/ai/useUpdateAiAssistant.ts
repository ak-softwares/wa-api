'use client';

import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { AIAssistant } from "@/types/Ai";

export function useUpdateAiAssistant(getPayload?: () => Partial<AIAssistant>) {
  const [isSaving, setIsSaving] = useState(false);

  const updateAIAssistantConfig = useCallback(async (data: Partial<AIAssistant>) => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/ai/ai-assistant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update AI Assistant config");

      const updated = await response.json();
      showToast.success("AI Assistant updated successfully!");

      return updated.data ?? updated;
    } catch (error: any) {
      showToast.error(`Error updating AI Assistant: ${error?.message || error}`);
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
      updateAIAssistantConfig(payload);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getPayload, updateAIAssistantConfig, isSaving]);

  return {
    isSaving,
    updateAIAssistantConfig,
  };
}
