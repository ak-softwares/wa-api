import mongoose, { Schema, Types, models } from "mongoose";

export interface IContact {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  name?: string;
  phones: string[];
  email?: string;
  tags?: string[];
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccount", required: true },
    name: { type: String, trim: true },
    phones: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    email: { type: String, trim: true, lowercase: true },
    tags: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const ContactModel = models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
