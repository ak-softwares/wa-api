"use client";

import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "sonner";

export function useSendWhatsappMessage() {
  const [isLoading, setIsLoading] = useState(false);

  // ⚡ Send WhatsApp message
  const sendMessage = async (
    to: string,
    message: string,
    onSuccess?: () => void
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/facebook/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        toast.success(data.message);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong while sending the message");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendMessage,
  };
}
