import mongoose, { Schema, model } from "mongoose";

const TemplateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  language: { type: String, required: true },
  components: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Template = mongoose.models.Template || model("Template", TemplateSchema);
