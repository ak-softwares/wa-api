"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { Message } from "@/types/Message";
import { MessagePaylaod } from "@/types/MessagePayload";

export function useSendWhatsappMessage() {
  const [isLoading, setIsLoading] = useState(false);

  // ⚡ Send WhatsApp message
  const sendMessage = async (
    messagePayload: MessagePaylaod,
    onSuccess?: (realMessage: Message) => void,
    onError?: (errorMsg: string) => void
  ): Promise<ApiResponse> => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/whatsapp/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messagePayload),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        if (onSuccess) onSuccess(data.data); // 👈 send real message back
      } else {
        if (onError) onError(data.message);
      }
      return { success: true, message: "Success", data };
    } catch (error: any) {
      const errorMsg = "Something went wrong while sending the message";
      if (onError) onError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendMessage,
  };
}
