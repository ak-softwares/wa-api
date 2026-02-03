import mongoose, { Schema, model, models } from "mongoose";
import { Types } from "mongoose";

export interface IApiToken {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  waAccountId?: Types.ObjectId;
  
  name?: string,            // "Production server", "Client A"
  
  token?: string;     
  tokenHashed?: string;
  permissions?: [string],   // read, send, webhook, etc

  isRevoked?: boolean,

  lastUsedAt?: Date,
  expiresAt?: Date,
  createdAt?: Date;
  updatedAt?: Date;
}

export const ApiTokenSchema = new Schema<IApiToken>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
    waAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "WaAccountModel" },
    name: { type: String},
    tokenHashed: { type: String, required: true, unique: true, index: true },
    permissions: [{ type: String }],
    isRevoked: { type: Boolean, default: false },
    lastUsedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

export const ApiTokenModel = models.ApiToken || model<IApiToken>("ApiToken", ApiTokenSchema);
