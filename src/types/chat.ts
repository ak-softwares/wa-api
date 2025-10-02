export type IChat = {
  _id: string;
  userId: string;             // owner of the chat
  participants: ChatParticipant[];     // phone numbers or waIds
  lastMessage?: string;
  lastMessageAt?: string;     // ISO date string
  unreadCount?: number;
  createdAt: string;          // ISO date string
  updatedAt: string;          // ISO date string
};

export type ChatParticipant = {
  id: string;
  name: string;
  imageUrl?: string;
};
