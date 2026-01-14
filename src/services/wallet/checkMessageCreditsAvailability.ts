import { FREE_MONTHLY_MESSAGES } from "@/utiles/constans/wallet";
import { Types } from "mongoose";
import { getOrCreateWallet } from "../apiHelper/getOrCreateWallet";
import { getOrCreateMonthlyUsage } from "../apiHelper/getOrCreateMonthlyUsage";

export interface CheckMessageCreditsAvailabilityParams {
  userId: Types.ObjectId;
  credits: number;
}

export async function checkMessageCreditsAvailability({userId, credits}: CheckMessageCreditsAvailabilityParams) {

  // get wallet (create if missing)
  const wallet = await getOrCreateWallet({ userId });

  // get monthly usage (create if missing)
  const monthlyUsage = await getOrCreateMonthlyUsage({ userId });

  const freeRemaining = Math.max(0, FREE_MONTHLY_MESSAGES - monthlyUsage.used);

  // use free first
  const freeToUse = Math.min(credits, freeRemaining);
  const paidToUse = credits - freeToUse;

  const allowed = wallet.balance >= paidToUse;

  return {
    allowed,
    walletBalance: wallet.balance,
    freeRemaining,
  };
}
