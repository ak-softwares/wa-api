import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";

interface OnChatStatePayload {
  chatId: string;
  opened: boolean;
}

interface UseChatOpenCloseOptions {
  onChange?: (payload: OnChatStatePayload) => void;
}

export function useChatOpenClose(options?: UseChatOpenCloseOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const setChatState = async (chatId: string, opened: boolean) => {
    if (!chatId) return;

    setIsLoading(true);

    try {
      const res = await fetch(`/api/wa-accounts/chats/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opened }),
      });

      const json: ApiResponse = await res.json();

      if (json.success) {

        options?.onChange?.({
          chatId,
          opened,
        });
      }
    } catch {
      // ❌ silent fail (no toast, no logs)
    } finally {
      setIsLoading(false);
    }
  };

  return {
    openChat: (chatId: string) => setChatState(chatId, true),
    closeChat: (chatId: string) => setChatState(chatId, false),
    isLoading,
  };
}