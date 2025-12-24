import { encrypt, safeDecrypt, hmacHash } from "@/lib/crypto";
import { AIChatSchema, IAIChat } from "./AIChat";
import { AIAgentSchema, IAIAgent } from "./AIAgent";
import crypto from "crypto";
import mongoose, { Schema, model, models } from "mongoose";
import { Types } from "mongoose";

export interface IWaAccount {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  permanent_token: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  last_onboarded_time?: Date;
  code_verification_status?: string;
  is_phone_number_registered?: boolean;
  is_app_subscribed?: boolean;
  aiChat?: IAIChat;
  aiAgent?: IAIAgent;
  apiToken?: string;
  apiTokenHashed?: string;
  apiTokenCreatedAt?: Date;
  apiTokenUpdatedAt?: Date;
  phone_number?: string;
  blockedNumbers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

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
    apiToken: {
      type: String,
      unique: true,
      sparse: true,
      set: (value?: string | null) => {
        if (!value) return null;
        return encrypt(String(value));
      },
      get: (value?: string | null) => {
        if (!value) return null;
        return safeDecrypt(value) ?? null;
      },
    },
    apiTokenHashed: String,
    apiTokenCreatedAt: { type: Date },
    apiTokenUpdatedAt: { type: Date },
  },
  {
    // _id: true,
    toJSON: { getters: true },
    toObject: { getters: true },
    timestamps: true,
  }
);

WaAccountSchema.methods.generateApiToken = function () {
  const rawToken = `wa_agent_${crypto.randomBytes(32).toString("hex")}`;
  this.apiToken = rawToken;
  this.apiTokenHashed = hmacHash(rawToken);
  const now = new Date();
  this.apiTokenCreatedAt ??= now;
  this.apiTokenUpdatedAt = now;
  return rawToken; // return for user display
};

export const WaAccountModel = models.WaAccount || model<IWaAccount>("WaAccount", WaAccountSchema);
