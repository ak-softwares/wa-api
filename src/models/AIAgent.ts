import { Schema, Document } from "mongoose";

export interface IAIAgent extends Document {
  webhookUrl?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AIAgentSchema = new Schema<IAIAgent>(
  {
    webhookUrl: { 
      type: String, 
      required: false,
      default: "" 
    },
    isActive: { 
      type: Boolean, 
      default: false 
    }
  },
  { 
    _id: false, // ✅ Prevent creation of _id
    timestamps: true // ✅ Automatically adds createdAt and updatedAt
  }
);