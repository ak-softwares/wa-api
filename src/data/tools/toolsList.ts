import { ToolStatus } from "@/types/Tool";
import { ToolCatalog, ToolCredentialType } from "@/types/Tool";

export const TOOLS_LIST: ToolCatalog[] = [
  {
    id: "woocommerce",
    name: "WooCommerce",
    desc: "Sync orders, customers, and products.",
    category: "Store",
    logo: "/assets/icons/tools/woocommerce.svg",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "storeUrl",
        label: "Store URL",
        placeholder: "https://yourstore.com",
        required: true,
        type: ToolCredentialType.URL
      },
      {
        key: "consumerKey",
        label: "Consumer Key",
        placeholder: "ck_xxxxxxxx",
        required: true,
        type: ToolCredentialType.KEY
      },
      {
        key: "consumerSecret",
        label: "Consumer Secret",
        placeholder: "cs_xxxxxxxx",
        required: true,
        type: ToolCredentialType.SECRET
      },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    desc: "Automate order updates and customer messages.",
    category: "Store",
    logo: "/assets/icons/tools/shopify.svg",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "shopDomain",
        label: "Shop Domain",
        placeholder: "your-store.myshopify.com",
        required: true,
        type: ToolCredentialType.URL
      },
      {
        key: "accessToken",
        label: "Access Token",
        placeholder: "shpat_xxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN
      },
    ],
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    desc: "Export leads, orders, and conversations to Sheets.",
    category: "Productivity",
    logo: "/assets/icons/tools/google-sheets.svg",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "sheetId",
        label: "Google Sheet ID",
        placeholder: "1AbCdEfGhIj...",
        required: true,
        type: ToolCredentialType.TEXT
      },
    ],
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    desc: "Auto-create events and send reminders on WhatsApp.",
    category: "Productivity",
    logo: "/assets/icons/tools/google-calendar.svg",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "calendarId",
        label: "Calendar ID",
        placeholder: "primary",
        required: true,
        type: ToolCredentialType.TEXT
      },
    ],
  },
  {
    id: "n8n",
    name: "n8n",
    desc: "Connect unlimited apps with your n8n agent.",
    category: "Automation",
    logo: "/assets/icons/tools/n8n.svg",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "baseUrl",
        label: "n8n Base URL",
        placeholder: "https://n8n.yourdomain.com",
        required: true,
        type: ToolCredentialType.URL
      },
      {
        key: "apiKey",
        label: "API Key",
        placeholder: "n8n_api_key_xxxxx",
        required: true,
        type: ToolCredentialType.KEY
      },
    ],
  },
  {
    id: "webhook",
    name: "Webhooks",
    desc: "Send and receive events via HTTP webhooks (POST).",
    category: "Automation",
    logo: "/assets/icons/tools/webhook.svg",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "webhookUrl",
        label: "Webhook URL",
        placeholder: "https://example.com/webhook",
        required: true,
        type: ToolCredentialType.URL
      },
      {
        key: "secret",
        label: "Secret (Optional)",
        placeholder: "your-secret",
        required: false,
        type: ToolCredentialType.SECRET
      },
    ],
  },
];
