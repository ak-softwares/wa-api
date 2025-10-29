// /models/AIAgent.ts

import { Schema } from "mongoose";
import { IAIAgent } from "@/types/AIAgent";

export const AIAgentSchema = new Schema<IAIAgent>(
  {
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
