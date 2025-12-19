import { encrypt, safeDecrypt } from "@/lib/crypto";
import { IWaAccount } from "@/types/WaAccount";
import { AIChatSchema } from "./AIChat";
import { AIAgentSchema } from "./AIAgent";
import mongoose, { Schema, model, models } from "mongoose";

export const WaAccountSchema = new Schema<IWaAccount>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone_number_id: { type: String, required: true },
    waba_id: { type: String, required: true },
    business_id: {
      type: String,
      required: true,
      set: (value: string) => encrypt(String(value)),
      get: (value: string) => safeDecrypt(value) ?? "",
    },
    permanent_token: {
      type: String,
      required: true,
      set: (value: string) => encrypt(String(value)),
      get: (value: string) => safeDecrypt(value) ?? "",
    },
    verified_name: String,
    display_phone_number: String,
    quality_rating: String,
    last_onboarded_time: { type: Date },
    code_verification_status: String,
    is_phone_number_registered: Boolean,
    is_app_subscribed: Boolean,
    blockedNumbers: {
      type: [String],
      default: [],
    },
    aiChat: { type: AIChatSchema },
    aiAgent: { type: AIAgentSchema },
  },
  {
    // _id: true,
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: true,
  }
);

export const WaAccount = models.WaAccount || model<IWaAccount>("WaAccount", WaAccountSchema);
