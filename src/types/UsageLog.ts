import mongoose from "mongoose";

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

// ✅ alias interface as a type — so you can use whichever you prefer
export type UsageLog = IUsageLog;