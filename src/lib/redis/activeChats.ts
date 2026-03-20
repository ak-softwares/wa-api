import { redis } from "@/lib/redis/redis";

// Key per chat
const getKey = (chatId: string) => `activeChat:${chatId}`;

// ✅ OPEN CHAT
export async function markChatOpen(chatId: string) {
  // set with expiry (auto-close if no activity)
  await redis.set(getKey(chatId), "1", "EX", 600); // 5 min
}

// ❌ CLOSE CHAT
export async function markChatClosed(chatId: string) {
  await redis.del(getKey(chatId));
}

// 🔍 CHECK
export async function isChatOpen(chatId: string): Promise<boolean> {
  const result = await redis.exists(getKey(chatId));
  return result === 1;
}

export async function safeIsChatOpen(chatId: string, timeout = 1000) {
  try {
    const result = await Promise.race([
      isChatOpen(chatId),
      new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), timeout) // fallback after timeout
      ),
    ]);

    return result;
  } catch (err) {
    console.error("Redis failed, fallback:", err);
    return false; // treat as closed
  }
}