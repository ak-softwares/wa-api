import mongoose, { Schema, Document, models, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IWaAccount, WaAccountSchema } from "./WaAccount";

// User interface

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: number;
  password: string;
  waAccounts?: IWaAccount; // Embedded WA accounts
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: Number, required: true },
    // force a single object, not an array
    waAccounts: { type: WaAccountSchema, required: false },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Prevent model overwrite in dev
export const User = models.User || model<IUser>("User", UserSchema);
