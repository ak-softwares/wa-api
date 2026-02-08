import mongoose, { Schema } from "mongoose";
import { Types } from "mongoose";

export interface IAiUsage {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId?: Types.ObjectId;
  chatId?: Types.ObjectId;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost?: number;
  outputCost?: number;
  totalCost?: number;
}

const AiUsageSchema = new Schema<IAiUsage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
  waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccount" },
  model: { type: String, required: true },
  inputTokens: { type: Number, required: true },
  outputTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  inputCost: { type: Number },
  outputCost: { type: Number },
  totalCost: { type: Number },
}, { timestamps: true });

export const AiUsageModel = mongoose.models.AiUsage || mongoose.model<IAiUsage>("AiUsage", AiUsageSchema);