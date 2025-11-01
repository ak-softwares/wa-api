import { Schema } from "mongoose";
import { IAIChat } from "@/types/AIChat";

export const AIChatSchema = new Schema<IAIChat>(
  {
    prompt: { type: String },
    isActive: { type: Boolean, default: false },
  },
  {
    _id: false,         // no separate _id for subdoc
    timestamps: true,   // adds createdAt & updatedAt
  }
);
