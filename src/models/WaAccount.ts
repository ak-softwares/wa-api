import { Schema } from "mongoose";

export interface IWaAccount {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  permanent_token: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
}

// WA Account subdocument schema
export const WaAccountSchema = new Schema<IWaAccount>(
  {
    phone_number_id: { type: String, required: true },
    waba_id: { type: String, required: true },
    business_id: { type: String, required: true },
    permanent_token: { type: String, required: true },
    verified_name: { type: String },
    display_phone_number: { type: String },
    quality_rating: { type: String },
  },
  { _id: false } // Prevent Mongoose from creating a separate _id for subdocuments
);
