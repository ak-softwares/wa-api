import { Schema } from "mongoose";

export interface IAIAgent {
  prompt?: string;
  webhookUrl?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AIAgentSchema = new Schema<IAIAgent>(
  {
    prompt: { type: String },
    webhookUrl: {
      type: String,
      required: false,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,       // ✅ keep as subdocument without id
    timestamps: true, // ✅ add createdAt & updatedAt
  }
);
