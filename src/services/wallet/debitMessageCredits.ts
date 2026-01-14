import mongoose, { Types } from "mongoose";
import { WalletModel } from "@/models/Wallet";
import { MonthlyUsageModel } from "@/models/MonthlyUsage";
import { FREE_MONTHLY_MESSAGES } from "@/utiles/constans/wallet";
import { getOrCreateMonthlyUsage } from "../apiHelper/getOrCreateMonthlyUsage";

interface DebitMessageCreditsParams {
  userId: Types.ObjectId;
  cost: number;
  session?: mongoose.ClientSession;
}

export async function debitMessageCredits({userId, cost, session}: DebitMessageCreditsParams) {

  const monthlyUsage = await getOrCreateMonthlyUsage({ userId, session });

  const freeRemaining = Math.max(0, FREE_MONTHLY_MESSAGES - monthlyUsage.used);

  const freeToUse = Math.min(cost, freeRemaining);
  const paidToUse = cost - freeToUse;

  // consume free
  if (freeToUse > 0) {
    await MonthlyUsageModel.updateOne(
      { _id: monthlyUsage._id },
      { $inc: { used: freeToUse } },
      { session }
    );
  }

  // consume paid
  if (paidToUse > 0) {
    const wallet = await WalletModel.findOneAndUpdate(
      { userId, balance: { $gte: paidToUse } },
      { $inc: { balance: -paidToUse } },
      { new: true, session }
    );

    if (!wallet) {
      throw new Error("Insufficient wallet balance while debiting credits");
    }
  }

  return { freeToUse, paidToUse };
}
