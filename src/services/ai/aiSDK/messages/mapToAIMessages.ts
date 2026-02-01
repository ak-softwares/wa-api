import type { ModelMessage } from "ai";
import { IMessage } from "@/models/Message";
import { messageToAIText } from "./messageToAIText";

interface Params {
  systemPrompt?: string;
  messages?: IMessage[];
  businessPhone?: string; // your WA phone_number_id
}

export function mapToAIMessages({
  systemPrompt,
  messages = [],
  businessPhone,
}: Params): ModelMessage[] {
  const aiMessages: ModelMessage[] = [];

  /* -------------------------
     System prompt first
  ------------------------- */
  if (systemPrompt) {
    aiMessages.push({
      role: "system",
      content: systemPrompt, // ✅ string only
    });
  }

  /* -------------------------
     Map chat history
  ------------------------- */
  for (const msg of messages) {
    const text = messageToAIText({ message: msg });

    if (!text) continue;

    const role: ModelMessage["role"] = msg.from === businessPhone ? "assistant" : "user";

    aiMessages.push({
      role,
      content: [{ type: "text", text }],
    });
  }
  // console.log("Mapped AI Messages:", JSON.stringify(aiMessages, null, 2));
  return aiMessages;
}

