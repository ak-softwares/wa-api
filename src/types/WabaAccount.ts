export type WaSetupStatus = {
  isTokenAvailable: boolean
  isPhoneRegistered: boolean
  isAppSubscription: boolean
  wabaAccountStatus: string
  isPhoneVerified: boolean
}

export type WabaAccount = {
  phone_numbers?: WabaPhoneNumber[]
  id?: string; // waba_id
  name?: string;
  currency?: string;
  account_review_status?: "APPROVED" | "PENDING" | "REJECTED" | string;
  message_template_namespace?: string;
};

export type WabaPhoneNumber = {
  verified_name?: string;
  code_verification_status?: "VERIFIED" | "NOT_VERIFIED" | string;
  display_phone_number?: string;
  quality_rating?: "GREEN" | "YELLOW" | "RED" | string;
  platform_type?: "CLOUD_API" | string;
  throughput?: {
    level?: "STANDARD" | "HIGH" | string;
  };
  last_onboarded_time?: string; // ISO date string
  webhook_configuration?: {
    application?: string; // webhook url
  };
  id?: string; // phone_number_id
};