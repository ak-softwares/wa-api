// /types/Contact.ts
import { Types } from "mongoose";

export interface IContact {
  userId: Types.ObjectId;
  name?: string;
  phones: string[];
  email?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
