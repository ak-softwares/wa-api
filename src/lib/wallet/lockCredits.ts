import { Wallet } from "@/models/Wallet";

export async function lockCredits(userId: string, cost: number) {
  const wallet = await Wallet.findOneAndUpdate(
    {
      userId,
      balance: { $gte: cost },
    },
    {
      $inc: {
        balance: -cost,
        locked: cost,
      },
    },
    { new: true }
  );

  if (!wallet) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  return wallet;
}
