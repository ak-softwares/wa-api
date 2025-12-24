import mongoose, { Schema, model, models } from "mongoose";

export interface IMonthlyUsage {
  userId: mongoose.Types.ObjectId;
  year: number;
  month: number; // 1-12
  used: number;  // messages used this month
}

const MonthlyUsageSchema = new Schema<IMonthlyUsage>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    used: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MonthlyUsageSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

export const MonthlyUsageModel = models.MonthlyUsage || model<IMonthlyUsage>("MonthlyUsage", MonthlyUsageSchema);
