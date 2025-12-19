import mongoose, { Schema, models, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser } from "@/types/User";
import { encrypt, safeDecrypt, hmacHash } from "@/lib/crypto";
import crypto from "crypto";
import { WaAccountSchema } from "./WaAccount";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    company: { type: String },
    defaultWaAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "WaAccount" },
    resetPasswordToken: String,
    apiToken: {
      type: String,
      unique: true,
      sparse: true,
      set: (value: string) => encrypt(String(value)),
      get: (value: string) => safeDecrypt(value) ?? "",
    },
    apiTokenHashed: String,
    resetPasswordExpires: Date,
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.generateApiToken = function () {
  const rawToken = `wa_agent_${crypto.randomBytes(32).toString("hex")}`;
  this.apiToken = rawToken;
  this.apiTokenHashed = hmacHash(rawToken);
  return rawToken; // return for user display
};

export const User = models.User || model<IUser>("User", UserSchema);
