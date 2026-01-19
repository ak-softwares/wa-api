export type Contact = {
  _id?: string;
  userId: string;
  waAccountId: string;
  name?: string;
  phones: string[];
  email?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImportedContact {
  id?: string;
  name?: string;
  phones: string[];
  email?: string;
  tags?: string[];
  imageUrl?: string;
  status?: "valid" | "invalid" | "duplicate";
  errors?: string[];
}