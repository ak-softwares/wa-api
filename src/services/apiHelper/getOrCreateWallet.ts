import { WalletModel } from "@/models/Wallet";
import { Types } from "mongoose";

interface GetOrCreateWalletParams {
  userId: Types.ObjectId;
}

export async function getOrCreateWallet({userId}: GetOrCreateWalletParams) {
  const wallet = await WalletModel.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        balance: 0,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return wallet;
}
