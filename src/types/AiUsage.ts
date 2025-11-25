import { Types } from "mongoose";

export interface IAiUsage {
  _id?: Types.ObjectId;
  userId: string;
  chatId?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptCost?: number;
  completionCost?: number;
  totalCost?: number;
}

export type AiUsage = IAiUsage;
