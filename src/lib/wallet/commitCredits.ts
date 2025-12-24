import { WalletModel } from "@/models/Wallet";

export async function commitCredits(userId: string, cost: number) {
  await WalletModel.updateOne(
    { userId },
    {
      $inc: { locked: -cost },
    }
  );
}
