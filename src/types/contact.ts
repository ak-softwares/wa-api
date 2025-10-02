export type IContact = {
  _id: string;
  userId: string;
  name?: string;
  phones: string[];   // multiple phone numbers
  email?: string;
  tags?: string[];
  imageUrl?: string;   // profile/contact photo
  lastMessage?: string;
  lastMessageAt?: string; // ISO date string
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
};
