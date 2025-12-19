import { Wallet } from "@/models/Wallet";

export async function refundCredits(userId: string, cost: number) {
  await Wallet.updateOne(
    { userId },
    {
      $inc: {
        balance: cost,
        locked: -cost,
      },
    }
  );
}
