import { Schema } from "mongoose";
import { IAIConfig } from "@/types/AIConfig";

export const AIConfigSchema = new Schema<IAIConfig>(
  {
    prompt: { type: String },
    isActive: { type: Boolean, default: false },
  },
  {
    _id: false,         // no separate _id for subdoc
    timestamps: true,   // adds createdAt & updatedAt
  }
);
