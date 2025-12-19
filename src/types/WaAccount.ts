import { IAIChat } from "./AIChat";
import { IAIAgent } from "./AIAgent";
import { Types } from "mongoose";

export interface IWaAccount {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  permanent_token: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  last_onboarded_time?: Date;
  code_verification_status?: string;
  is_phone_number_registered?: boolean;
  is_app_subscribed?: boolean;
  aiChat?: IAIChat;
  aiAgent?: IAIAgent;
  phone_number?: string;
  blockedNumbers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type WaAccount = IWaAccount;