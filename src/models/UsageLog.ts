import { IUsageLog } from "@/types/UsageLog";
import mongoose, { Schema, model, models } from "mongoose";

const UsageLogSchema = new Schema<IUsageLog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    waAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "WaAccount" },
    phoneNumber: String,
    actionType: {
    type: String,
      required: true,
      enum: ["SEND_TEXT", "SEND_MEDIA", "AI_REPLY", "TEMPLATE"],
    },

    creditsUsed: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    messageId: String,
    error: String,
  },
  { timestamps: true }
);

export const UsageLog = models.UsageLog || model<IUsageLog>("UsageLog", UsageLogSchema);
