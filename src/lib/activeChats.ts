// lib/activeChats.ts
export const activeChats = new Map<string, Set<string>>();
// Structure: Map<userId, Set<chatId>>

// Helper functions (optional)
export function markChatOpen(userId: string, chatId: string) {
  if (!activeChats.has(userId)) activeChats.set(userId, new Set());
  activeChats.get(userId)!.add(chatId);
}

export function markChatClosed(userId: string, chatId: string) {
  const userChats = activeChats.get(userId);
  if (userChats) {
    userChats.delete(chatId);
    if (userChats.size === 0) activeChats.delete(userId);
  }
}

export function isChatOpen(userId: string, chatId: string): boolean {
  return activeChats.get(userId)?.has(chatId) || false;
}
