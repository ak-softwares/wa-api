import mongoose, { Schema, Document, models, model } from "mongoose";
import bcrypt from "bcryptjs";
import { WaAccountSchema } from "./WaAccount";
import { IUser } from "@/types/User";

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    company: { type: String },
    waAccounts: { type: [WaAccountSchema], default: [] },
    resetPasswordToken: String,
    apiToken: { type: String, unique: true, sparse: true },
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const User =
  models.User || model<IUser>("User", UserSchema);
