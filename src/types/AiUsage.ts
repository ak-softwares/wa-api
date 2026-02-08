export type IAiUsage = {
  _id?: string;
  userId: string;
  waAccountId?: string;
  chatId?: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost?: number;
  outputCost?: number;
  totalCost?: number;
}
