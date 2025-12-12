import { Chat } from "@/models/Chat";
import { IChat } from "@/types/Chat";
import { Types } from "mongoose";

interface GetOrCreateChatArgs {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  from: string;
  chatCache: Map<string, IChat>;
}

export async function getOrCreateChat({
  userId,
  waAccountId,
  from,
  chatCache,
}: GetOrCreateChatArgs) {
  try{
    // 1. Check cache
    let chat = chatCache.get(from);
    if (chat) return chat;

    // 2. Find or create in DB
    chat = await Chat.findOneAndUpdate(
        {
            userId,
            waAccountId,
            "participants.number": from, // participants: { $elemMatch: { number: from } }
            type: { $ne: "broadcast" }, // exclude broadcast
        },
        {
            $setOnInsert: {
                userId,
                waAccountId,
                participants: [{ number: from }],
                type: "single",
            },
        },
        {
            upsert: true,  // create if not exists
            new: true,     // return updated/new document
            setDefaultsOnInsert: true, 
        }
    );

    // 3. Cache and return
    if (!chat) throw new Error("Chat creation failed");
    chatCache.set(from, chat);
    return chat;
  } catch (err) {
    // console.error("❌ Error in getOrCreateChat:", err);

    // Optional: log to DB or Sentry
    // await Log.create({ type: "chat_error", error: err, from, userId });
    return null; // Signal failure safely
  }
}
