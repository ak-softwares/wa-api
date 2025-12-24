import { WalletModel } from "@/models/Wallet";

export async function refundCredits(userId: string, cost: number) {
  await WalletModel.updateOne(
    { userId },
    {
      $inc: {
        balance: cost,
        locked: -cost,
      },
    }
  );
}
