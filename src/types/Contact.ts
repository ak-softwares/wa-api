import { Types } from "mongoose";

export interface IContact {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  name?: string;
  phones: string[];
  email?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
// ✅ alias interface as a type — so you can use whichever you prefer
export type Contact = IContact;