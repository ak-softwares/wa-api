import mongoose, { Schema, model, models } from "mongoose";

export interface IUsageLog {
  userId: mongoose.Types.ObjectId;
  waAccountId?: mongoose.Types.ObjectId;
  phoneNumber?: string;
  actionType: "SEND_TEXT" | "SEND_MEDIA" | "AI_REPLY" | "TEMPLATE";
  creditsUsed: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  messageId?: string;
  error?: string;
}

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

export const UsageLogModel = models.UsageLog || model<IUsageLog>("UsageLog", UsageLogSchema);
