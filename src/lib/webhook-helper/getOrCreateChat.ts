import { Chat } from "@/models/Chat";
import { ChatType, IChat } from "@/types/Chat";
import { Types } from "mongoose";

interface GetOrCreateChatArgs {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  phone: string;
  chatCache?: Map<string, IChat>;
}

export async function getOrCreateChat({
  userId,
  waAccountId,
  phone,
  chatCache,
}: GetOrCreateChatArgs) {
  try {
    // 1. Check cache (if provided)
    if (chatCache) {
      const cachedChat = chatCache.get(phone);
      if (cachedChat) return cachedChat;
    }

    // 2. Find or create in DB
    const chat = await Chat.findOneAndUpdate(
      {
        userId,
        waAccountId,
        "participants.number": phone,
        type: { $ne: ChatType.BROADCAST },
      },
      {
        $setOnInsert: {
          userId,
          waAccountId,
          participants: [{ number: phone }],
          type: ChatType.CHAT,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!chat) throw new Error("Chat creation failed");

    // 3. Cache result (if cache exists)
    chatCache?.set(phone, chat);

    return chat;
  } catch (err) {
    return null;
  }
}

