export type AnalyticsData = {
  totalMessages?: number;

  // API level
  apiSentMessages?: number;        // 🔹 wamid received (you already have this)

  // Webhook level (Meta confirmation)
  fbAcceptedMessages?: number;     // 🔹 webhook "sent" received

  // Delivery lifecycle
  deliveredMessages?: number;
  readMessages?: number;

  // AI
  aIReplies?: number;
  aICost?: number;

  // Billing
  creditSpend?: number;
};
