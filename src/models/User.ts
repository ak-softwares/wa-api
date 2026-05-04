import mongoose, { Schema, models, model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  phone: number;
  company?: string;
  password?: string;
  isVerified: boolean;
  defaultWaAccountId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },  // sparse allows multiple null values
    phone: { type: Number, required: true, unique: true },
    password: { type: String },
    company: { type: String },
    isVerified: { type: Boolean, default: false },
    defaultWaAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "WaAccount" },
  },
  { 
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.password) return next();
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const UserModel = models.User || model<IUser>("User", UserSchema);
