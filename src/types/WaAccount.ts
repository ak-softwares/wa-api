import { IAIConfig } from "./AIConfig";
import { IAIAgent } from "./AIAgent";

export interface IWaAccount {
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  permanent_token: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  last_onboarded_time?: Date;
  business_verification_status?: boolean;
  is_phone_number_registered?: boolean;
  is_app_subscribed?: boolean;
  aiConfig?: IAIConfig;
  aiAgent?: IAIAgent;
  default?: boolean;
  phone_number?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ alias interface as a type — so you can use whichever you prefer
export type WaAccount = IWaAccount;