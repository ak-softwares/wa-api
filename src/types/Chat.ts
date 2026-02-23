export enum ChatType {
  CHAT = "chat",
  GROUP = "group",
  BROADCAST = "broadcast",
  CAMPAIGN = "campaign",
}

export type ChatFilterType = "all" | "unread" | "favourite" | "broadcast";

export const FILTERS: { key: ChatFilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "favourite", label: "Favourite" },
  { key: "broadcast", label: "Broadcasts" },
];

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
