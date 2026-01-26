import { TemplateComponentCreate } from "@/types/Template";
import { TemplateCategory, TemplateStatus } from "@/utiles/enums/template";
import mongoose, { Schema, Types, model } from "mongoose";

export interface ITemplate {
  _id: Types.ObjectId;
  id?: string;
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  name: string;
  category: TemplateCategory;
  language: string; // e.g. "en"
  components?: TemplateComponentCreate[];
  status?: TemplateStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const TemplateSchema = new Schema<ITemplate>({
  id: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "UserModel", required: true },
  waAccountId: { type: Schema.Types.ObjectId, ref: "WaAccountModel", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  language: { type: String, required: true },
  components: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const TemplateModel = mongoose.models.Template || model<ITemplate>("Template", TemplateSchema);
