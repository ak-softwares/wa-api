'use client';

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { AIChat } from "@/types/AIChat";

export function useGetAiChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiChat, setAiChat] = useState<AIChat>({
    prompt: "",
    isActive: false,
  });

  const getAIChatConfig = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/wa-accounts/ai/ai-chat");
      if (!response.ok) throw new Error("Failed to load AI Chat config");

      const result = await response.json();
      const data = result.data ?? { prompt: "", isActive: false };

      setAiChat(data);
      return data;
    } catch (error: any) {
      toast.error(`Error: ${error?.message || error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getAIChatConfig();
  }, [getAIChatConfig]);

  return {
    aiChat,
    setAiChat,
    isLoading,
    getAIChatConfig,
  };
}
