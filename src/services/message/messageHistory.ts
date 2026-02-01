import { IMessage, MessageModel } from "@/models/Message";
import { Types } from "mongoose";

interface Params {
  chatId: Types.ObjectId;
  length?: number;
}
    
export async function messageHistory({ chatId, length = 20 }: Params): Promise<IMessage[]> {
  const messages = await MessageModel.find({
    chatId: chatId,
  })
    .sort({ createdAt: -1 })
    .limit(length)
    .lean<IMessage[]>();

  return messages.reverse();
}