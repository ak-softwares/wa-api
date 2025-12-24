import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";

export interface IAiUsage {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId?: Types.ObjectId;
  chatId?: Types.ObjectId;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptCost?: number;
  completionCost?: number;
  totalCost?: number;
}

const AiUsageSchema = new Schema<IAiUsage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
  waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccount" },
  model: { type: String, required: true },
  promptTokens: { type: Number, required: true },
  completionTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  promptCost: { type: Number },
  completionCost: { type: Number },
  totalCost: { type: Number },
}, { timestamps: true });

export const AiUsageModel = mongoose.models.AiUsage || mongoose.model<IAiUsage>("AiUsage", AiUsageSchema);