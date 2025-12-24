import { Schema } from "mongoose";

export interface IAIChat {
  prompt?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
