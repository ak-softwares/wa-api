import { Schema } from "mongoose";

export interface IAIAssistant {
  prompt?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AIAssistantSchema = new Schema<IAIAssistant>(
  {
    prompt: { type: String },
    isActive: { type: Boolean, default: false },
  },
  {
    _id: false,         // no separate _id for subdoc
    timestamps: true,   // adds createdAt & updatedAt
  }
);
