'use client';

import { useCallback, useEffect, useState } from "react";
import { showToast } from "@/components/ui/sonner";
import { AIAssistant } from "@/types/Ai";

export function useAiAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiAssistant, setAiAssistant] = useState<AIAssistant>({
    prompt: "",
    isActive: false,
  });

  const getAIAssistantConfig = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/ai/ai-assistant");
      if (!response.ok) throw new Error("Failed to load AI Assistant config");

      const result = await response.json();
      const data = result.data ?? { prompt: "", isActive: false };

      setAiAssistant(data);
      return data;
    } catch (error: any) {
      showToast.error(`Error: ${error?.message || error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getAIAssistantConfig();
  }, [getAIAssistantConfig]);

  return {
    aiAssistant,
    setAiAssistant,
    isLoading,
    getAIAssistantConfig,
  };
}
