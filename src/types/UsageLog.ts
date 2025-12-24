export type UsageLog = {
  userId: string;
  waAccountId?: string;
  phoneNumber?: string;
  actionType: "SEND_TEXT" | "SEND_MEDIA" | "AI_REPLY" | "TEMPLATE";
  creditsUsed: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  messageId?: string;
  error?: string;
}