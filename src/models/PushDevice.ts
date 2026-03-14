import { Schema, model, models, Types } from "mongoose";

export interface IPushDevice {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  deviceId: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PushDeviceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    token: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Auto cleanup: remove tokens not used for 60 days
PushDeviceSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 60 * 24 * 60 * 60 }
);

// Ensure one device per user
PushDeviceSchema.index({ userId: 1, deviceId: 1 },{ unique: true });

export const PushDeviceModel = models.PushDevice || model("PushDevice", PushDeviceSchema);