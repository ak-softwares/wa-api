import { ToolStatus } from "@/types/Tool";
import mongoose, { Schema, Types, model } from "mongoose";
import { encrypt, safeDecrypt } from "@/lib/crypto";

// ✅ encrypt only object values (not keys)
const encryptCredentials = (obj: Record<string, string>) => {
  const out: Record<string, string> = {};
  for (const key in obj) {
    out[key] = obj[key] ? encrypt(String(obj[key])) : "";
  }
  return out;
};

// ✅ decrypt only object values (not keys)
const decryptCredentials = (obj: Record<string, string>) => {
  const out: Record<string, string> = {};
  for (const key in obj) {
    out[key] = obj[key] ? safeDecrypt(obj[key]) ?? "" : "";
  }
  return out;
};

export interface ITool extends mongoose.Document {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;

  id: string;
  name: string;
  category?: string;

  status: ToolStatus;
  active: boolean;
  credentials: Record<string, string>;

  createdAt?: Date;
  updatedAt?: Date;
}

const ToolSchema = new Schema<ITool>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
    waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccountModel", required: true },

    id: { type: String, required: true }, // tool id (shopify, webhook etc.)
    name: { type: String, required: true },
    category: { type: String, required: false },

    status: {
      type: String,
      enum: Object.values(ToolStatus),
      default: ToolStatus.NOT_CONNECTED,
    },
    active: { type: Boolean, default: false },

    credentials: {
      type: Object,
      default: {},
      set: (v: Record<string, any>) => encryptCredentials(v || {}),
      get: (v: Record<string, string>) => decryptCredentials(v || {}),
    },
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
   }
);

// ✅ prevent duplicate tool integration per account
ToolSchema.index({ userId: 1, waAccountId: 1, id: 1 }, { unique: true });

export const ToolModel = mongoose.models.Tool || model<ITool>("Tool", ToolSchema);
