import mongoose, { Schema, Document, models } from "mongoose";

export interface IContact extends Document {
  userId: mongoose.Types.ObjectId;
  name?: string;
  phones: string[]; // multiple phone numbers
  email?: string; // optional
  tags?: string[];
  imageUrl?: string; // profile/contact photo
  createdAt: Date;
  updatedAt: Date;
}

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

// Avoid model overwrite on hot-reload
export default models.Contact || mongoose.model<IContact>("Contact", ContactSchema);
