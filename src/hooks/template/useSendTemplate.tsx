"use client";

import { useState, useCallback } from "react";
import { Template } from "@/types/Template";
import { IMessage, Message } from "@/types/Message";
import { toast } from "@/components/ui/sonner";
import { Types } from "mongoose";
import { useMessageStore } from "@/store/messageStore";

interface SendTemplateParams {
  chatId: Types.ObjectId;
  template: Template;
}

interface SendTemplateResult {
  success: boolean;
  data?: IMessage[];
  message: string;
}

export function useSendTemplate() {
  const [loading, setLoading] = useState(false);
  const { setAppendMessage } = useMessageStore();

  const sendTemplate = useCallback(
    async ({ chatId, template }: SendTemplateParams): Promise<SendTemplateResult> => {
      try {
        setLoading(true);

        const response = await fetch("/api/whatsapp/messages/send-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, template }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          toast.error(result.message || "Failed to send template");
          return { success: false, message: result.message || "Failed to send template" };
        }

        const realMessage: Message = result.data[0];
        
        // -------------------------------
        // 4) Replace TEMP with REAL
        // -------------------------------
        setAppendMessage(realMessage);
 
        toast.success("Template message sent 🚀");

        return {
          success: true,
          data: result.data,
          message: result.message,
        };
      } catch (error: any) {
        console.error("Error sending template:", error);
        toast.error(error.message || "Something went wrong");
        return { success: false, message: error.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    sendTemplate,
  };
}
