export type IChat = {
  _id: string;
  userId: string; // Owner of the chat (your system user)
  participants: ChatParticipant[]; // list of recipients (customers)

  type: "single" | "broadcast"; // chat type

  chatName?: string;   // only used for broadcast chats
  chatImage?: string;  // optional image for broadcast chats

  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;

  createdAt: Date;
  updatedAt: Date;
};

export type ChatParticipant = {
  number: string;
  name?: string;
  imageUrl?: string;
};
