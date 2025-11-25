import { IAiUsage } from "@/types/AiUsage";
import mongoose, { Schema, models } from "mongoose";

const AiUsageSchema = new Schema<IAiUsage>({
  userId: { type: String, required: true },
  chatId: { type: String },
  model: { type: String, required: true },
  promptTokens: { type: Number, required: true },
  completionTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  promptCost: { type: Number },
  completionCost: { type: Number },
  totalCost: { type: Number },
}, { timestamps: true });

export const AiUsage = mongoose.models.AiUsage || mongoose.model<IAiUsage>("AiUsage", AiUsageSchema);