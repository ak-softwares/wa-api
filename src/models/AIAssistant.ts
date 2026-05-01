import mongoose, { Schema, Types, model, models } from "mongoose";

export interface IAIAssistant {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  prompt?: string;
  isActive?: boolean;
  messageLimit?: number;
  limitWindowInHours?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AIAssistantSchema = new Schema<IAIAssistant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    prompt: { type: String },
    isActive: { type: Boolean, default: false },
    messageLimit: { type: Number, default: 20, min: 1 },
    limitWindowInHours: { type: Number, default: 1, min: 1 },
  },
  {
    timestamps: true,
  }
);

export const AIAssistantModel = models.AIAssistant || model<IAIAssistant>("AIAssistant", AIAssistantSchema);