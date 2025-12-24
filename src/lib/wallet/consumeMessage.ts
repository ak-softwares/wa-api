import { MonthlyUsageModel } from "@/models/MonthlyUsage";
import { lockCredits } from "./lockCredits";
import { FREE_MONTHLY_MESSAGES } from "@/utiles/constans/wallet";

export async function consumeMessage(userId: string, cost: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Get or create monthly usage
  const usage = await MonthlyUsageModel.findOneAndUpdate(
    { userId, year, month },
    { $setOnInsert: { used: 0 } },
    { upsert: true, new: true }
  );

  // 1️⃣ Use FREE quota first
  if (usage.used < FREE_MONTHLY_MESSAGES) {
    await MonthlyUsageModel.updateOne(
      { _id: usage._id },
      { $inc: { used: 1 } }
    );

    return { type: "FREE" };
  }

  // 2️⃣ Use PAID credits
  await lockCredits(userId, cost);
  return { type: "PAID" };
}
