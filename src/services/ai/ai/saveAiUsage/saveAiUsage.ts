import { AiUsageModel } from "@/models/AiUsage";
import { AI_PROVIDERS, ProviderKey } from "../providers/providers";
import { round } from "@/lib/helper/math";

type SaveUsageParams = {
  provider: ProviderKey;
  usage: any;
  userId: string;
};

export async function saveAiUsage({
  provider,
  usage,
  userId,
}: SaveUsageParams) {
  if (!usage) {
    throw new Error("AI provider did not return usage info.");
  }

  const aiProvider = AI_PROVIDERS[provider];
  const inputTokens = Number(usage?.inputTokens ?? 0);
  const outputTokens = Number(usage?.outputTokens ?? 0);
  const totalTokens = Number(usage?.totalTokens ?? 0);

  const inputCost = round((inputTokens / 1_000_000) * aiProvider.inputPrice);
  const outputCost = round((outputTokens / 1_000_000) * aiProvider.outputPrice);
  const totalCost = inputCost + outputCost;

  return AiUsageModel.create({
    userId,
    model: aiProvider.id,
    inputTokens: inputTokens,
    outputTokens: outputTokens,
    totalTokens: totalTokens,
    inputCost,
    outputCost,
    totalCost,
  });
}
