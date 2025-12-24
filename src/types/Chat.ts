export enum ChatType {
  CHAT = "chat",
  GROUP = "group",
  BROADCAST = "broadcast",
  CAMPAIGN = "campaign",
}

export type ChatParticipant = {
  number: string;
  name?: string;
  imageUrl?: string;
}

export type Chat = {
  _id?: string;
  userId: string;
  waAccountId: string;
  participants: ChatParticipant[];
  type: ChatType;
  chatName?: string;
  chatImage?: string;
  isFavourite?: boolean
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
