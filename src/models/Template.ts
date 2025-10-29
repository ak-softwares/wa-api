import { ITemplate } from "@/types/Template";
import mongoose, { Schema, model } from "mongoose";

const TemplateSchema = new Schema<ITemplate>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccount", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  language: { type: String, required: true },
  components: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export const Template = mongoose.models.Template || model<ITemplate>("Template", TemplateSchema);
