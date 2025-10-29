// /models/Contact.ts
import mongoose, { Schema, models } from "mongoose";
import { IContact } from "@/types/Contact";

const ContactSchema = new Schema<IContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export default models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
