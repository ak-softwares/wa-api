import { encrypt, safeDecrypt, hmacHash } from "@/lib/crypto";
import { AIChatSchema, IAIChat } from "./AIChat";
import crypto from "crypto";
import mongoose, { Schema, model, models } from "mongoose";
import { Types } from "mongoose";

export interface IWabaAccount {
  phone_numbers?: IWabaPhoneNumber[]
  id?: string; // waba_id
  name?: string;
  currency?: string;
  account_review_status?: "APPROVED" | "PENDING" | "REJECTED" | string;
  message_template_namespace?: string;
};

export interface IWabaPhoneNumber {
  id?: string; // phone_number_id
  verified_name?: string;
  code_verification_status?: "VERIFIED" | "NOT_VERIFIED" | string;
  display_phone_number?: string;
  quality_rating?: "GREEN" | "YELLOW" | "RED" | string;
  platform_type?: "CLOUD_API" | string;
  throughput?: {
    level: "STANDARD" | "HIGH" | string;
  };
  last_onboarded_time?: string; // ISO date string
  webhook_configuration?: {
    application: string; // webhook url
  };
};

export interface IWaAccount {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  phone_number_id: string;
  waba_id: string;
  wabaAccount?: IWabaAccount;
  business_id: string;
  permanent_token: string;
  is_phone_number_registered?: boolean;
  is_app_subscribed?: boolean;
  aiChat?: IAIChat;
  apiToken?: string;
  apiTokenHashed?: string;
  apiTokenCreatedAt?: Date;
  apiTokenUpdatedAt?: Date;
  phone_number?: string;
  blockedNumbers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/** ✅ Subschema: Phone Number */
const WabaPhoneNumberSchema = new Schema<IWabaPhoneNumber>(
  {
    id: { type: String, required: true },
    verified_name: { type: String },
    code_verification_status: { type: String },
    display_phone_number: { type: String },
    quality_rating: { type: String },
    platform_type: { type: String },
    throughput: {
      level: { type: String },
    },
    last_onboarded_time: { type: String },
    webhook_configuration: {
      application: { type: String },
    },
  },
  { _id: false }
);

/** ✅ Subschema: WABA Account */
const WabaAccountSchema = new Schema<IWabaAccount>(
  {
    phone_numbers: { type: [WabaPhoneNumberSchema], default: [] },
    id: { type: String },
    name: { type: String },
    currency: { type: String },
    account_review_status: { type: String },
    message_template_namespace: { type: String },
  },
  { _id: false }
);

export const WaAccountSchema = new Schema<IWaAccount>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone_number_id: { type: String, required: true },
    waba_id: { type: String, required: true },
    wabaAccount: { type: WabaAccountSchema, default: undefined },
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
    is_phone_number_registered: Boolean,
    is_app_subscribed: Boolean,
    blockedNumbers: {
      type: [String],
      default: [],
    },
    aiChat: { type: AIChatSchema },
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
