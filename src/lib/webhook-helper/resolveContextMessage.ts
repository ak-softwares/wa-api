import { Message } from "@/models/Message";
import { Context } from "@/types/Message";
import { Types } from "mongoose";

export async function resolveContextMessage(chatId: Types.ObjectId, context: Context | undefined) {
  if (!context?.id) return context;

  const originalMessage = await Message.findOne({
    chatId,
    waMessageId: context.id,
  });

  if (originalMessage) {
    context.message = originalMessage.message;
  }

  return context;
}
