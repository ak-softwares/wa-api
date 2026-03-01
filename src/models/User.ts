import mongoose, { Schema, models, model, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { AIAssistantSchema, IAIAssistant } from "./AIAssistant";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: number;
  company?: string;
  password: string;
  defaultWaAccountId?: Types.ObjectId;
  aiAssistant?: IAIAssistant;
  createdAt?: Date;
  updatedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    password: { type: String, required: true },
    company: { type: String },
    defaultWaAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "WaAccount" },
    aiAssistant: { type: AIAssistantSchema },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { 
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const UserModel = models.User || model<IUser>("User", UserSchema);
