import { Wallet } from "@/models/Wallet";

export async function commitCredits(userId: string, cost: number) {
  await Wallet.updateOne(
    { userId },
    {
      $inc: { locked: -cost },
    }
  );
}
