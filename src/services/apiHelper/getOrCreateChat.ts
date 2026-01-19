import { ChatModel, IChat } from "@/models/Chat";
import { ChatParticipant, ChatType } from "@/types/Chat";
import { Types } from "mongoose";

interface GetOrCreateChatArgs {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  participant: ChatParticipant;
  chatCache?: Map<string, IChat>;
}

export async function getOrCreateChat({
  userId,
  waAccountId,
  participant,
  chatCache,
}: GetOrCreateChatArgs) {
  try {
    // 1. Check cache (if provided)
    if (chatCache) {
      const cachedChat = chatCache.get(participant.number);
      if (cachedChat) return cachedChat;
    }

    // 2. Find or create in DB
    const chat = await ChatModel.findOneAndUpdate(
      {
        userId,
        waAccountId,
        "participants.number": participant.number,
        type: { $ne: ChatType.BROADCAST },
      },
      {
        $setOnInsert: {
          userId,
          waAccountId,
          participants: [participant],
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
    chatCache?.set(participant.number, chat);

    return chat;
  } catch (err) {
    return null;
  }
}

