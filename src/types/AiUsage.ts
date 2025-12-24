export type IAiUsage = {
  _id?: string;
  userId: string;
  waAccountId?: string;
  chatId?: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptCost?: number;
  completionCost?: number;
  totalCost?: number;
}
