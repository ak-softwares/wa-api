import { AIAgent } from "./AIAgent";
import { AIChat } from "./AIChat";

export type WaAccount = {
  _id?: string;
  userId: string;
  phone_number_id: string;
  waba_id: string;
  business_id: string;
  permanent_token: string;
  verified_name?: string;
  display_phone_number?: string;
  quality_rating?: string;
  last_onboarded_time?: string;
  code_verification_status?: string;
  is_phone_number_registered?: boolean;
  is_app_subscribed?: boolean;
  aiChat?: AIChat;
  aiAgent?: AIAgent;
  apiToken?: string;
  apiTokenHashed?: string;
  apiTokenCreatedAt?: string;
  apiTokenUpdatedAt?: string;
  phone_number?: string;
  blockedNumbers?: string[];
  createdAt?: string;
  updatedAt?: string;
}
