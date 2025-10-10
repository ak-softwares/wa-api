import { Schema, Document } from "mongoose";

export interface IAIConfig extends Document {
  prompt?: string;
  isActive?: boolean;
}

export const AIConfigSchema = new Schema<IAIConfig>(
  {
    prompt: { type: String, required: false },
    isActive: { type: Boolean, default: false },
  },
  { 
    _id: false, // ✅ Prevent creation of _id
    timestamps: true
  }
);
