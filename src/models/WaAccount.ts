import { Schema } from "mongoose";
import { encrypt, safeDecrypt} from "@/lib/crypto";

export interface IWaAccount {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  permanent_token: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  business_verification_status?: boolean;
  is_phone_number_registered?: boolean;
}

// WA Account subdocument schema
export const WaAccountSchema = new Schema<IWaAccount>(
  {
    phone_number_id: { type: String, required: true },
    waba_id: { type: String, required: true },
    business_id: { 
      type: String, 
      required: true,
      set: (value: string) => encrypt(String(value)),
      get: (value: string) => safeDecrypt(value) ?? ""
    },
    permanent_token: { 
      type: String, 
      required: true,
      set: (value: string) => encrypt(String(value)),
      get: (value: string) => safeDecrypt(value) ?? ""
    },
    verified_name: { type: String },
    display_phone_number: { type: String },
    quality_rating: { type: String },
    business_verification_status: { type: Boolean },
    is_phone_number_registered: { type: Boolean },
  },
  { 
    _id: false, // Prevent Mongoose from creating a separate _id for subdocuments
    toJSON: { getters: true }, // Ensure getters are applied when converting to JSON
    toObject: { getters: true } // Ensure getters are applied when converting to object
  }
);