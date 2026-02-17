import { FREE_MONTHLY_MESSAGES } from "@/utiles/constans/wallet";
import { Types } from "mongoose";
import { getOrCreateWallet } from "../apiHelper/getOrCreateWallet";
import { getOrCreateMonthlyUsage } from "../apiHelper/getOrCreateMonthlyUsage";

export interface CheckMessageCreditsAvailabilityParams {
  userId: Types.ObjectId;
  credits: number;
}

export async function checkMessageCreditsAvailability({userId, credits}: CheckMessageCreditsAvailabilityParams) {

  // 1️⃣ First get monthly usage only
  const monthlyUsage = await getOrCreateMonthlyUsage({ userId });
  const freeRemaining = Math.max(0, FREE_MONTHLY_MESSAGES - monthlyUsage.used);
  // 2️⃣ If free messages are enough → allow immediately
  if (freeRemaining >= credits) {
    return {
      allowed: true,
      walletBalance: null, // wallet not needed
      freeRemaining,
    };
  }

  // 3️⃣ Otherwise check wallet only when needed
  const wallet = await getOrCreateWallet({ userId });
  const paidRequired = credits - freeRemaining;

  const allowed = wallet.balance >= paidRequired;
  return {
    allowed,
    walletBalance: wallet.balance,
    freeRemaining,
  };
}
