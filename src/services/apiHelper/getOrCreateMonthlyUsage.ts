import { MonthlyUsageModel } from "@/models/MonthlyUsage";
import mongoose, { Types } from "mongoose";

interface GetOrCreateMonthlyUsageParams {
  userId: Types.ObjectId;
  session?: mongoose.ClientSession;
}

export async function getOrCreateMonthlyUsage({ userId, session}: GetOrCreateMonthlyUsageParams) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  const monthlyUsage = await MonthlyUsageModel.findOneAndUpdate(
    { userId, year, month },
    {
      $setOnInsert: {
        userId,
        year,
        month,
        used: 0,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      session
    }
  );

  return monthlyUsage;
}
