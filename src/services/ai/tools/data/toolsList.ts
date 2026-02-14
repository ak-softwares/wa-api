import { AuthType } from "@/types/OAuth";
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
    logo: "/assets/icons/tools/google-sheets.svg",
    category: "Productivity",
    status: ToolStatus.NOT_CONNECTED,
    active: false,

    authType: AuthType.OAUTH,
    credentials: [
      {
        key: "sheetId",
        label: "Google Sheet ID",
        placeholder: "1AbCdEfGhIj...",
        required: true,
        type: ToolCredentialType.TEXT,
      },
      {
        key: "access_token",
        label: "Access Token",
        placeholder: "ya29.a0AUMWxxxxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN,
      },
      {
        key: "refresh_token",
        label: "Refresh Token",
        placeholder: "1//0gVVXmyRCEykPCgxxxxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN,
      },
      {
        key: "expiry_date",
        label: "Expiry Date (timestamp)",
        placeholder: "1770919499790",
        required: true,
        type: ToolCredentialType.TEXT,
      },
      {
        key: "scope",
        label: "Scope",
        placeholder: "https://www.googleapis.com/auth/contacts",
        required: false,
        type: ToolCredentialType.TEXT,
      }
    ],
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    desc: "Auto-create events and reminders.",
    logo: "/assets/icons/tools/google-calendar.svg",
    category: "Productivity",
    status: ToolStatus.NOT_CONNECTED,
    active: false,

    authType: AuthType.OAUTH,
    credentials: [
      {
        key: "calendarId",
        label: "Calendar ID",
        placeholder: "primary",
        required: true,
        type: ToolCredentialType.TEXT,
      },
      {
        key: "access_token",
        label: "Access token",
        placeholder: "ya29.a0AUMWxxxxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN,
      },
      {
        key: "refresh_token",
        label: "Refresh token",
        placeholder: "1//0gVVXmyRCEykPCgxxxxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN,
      },
      {
        key: "expiry_date",
        label: "Expiry date",
        placeholder: "1770919499790",
        required: true,
        type: ToolCredentialType.TEXT,
      },
      {
        key: "scope",
        label: "Scope",
        placeholder: "https://www.googleapis.com/auth/calendar",
        required: false,
        type: ToolCredentialType.TEXT,
      }
    ],
  },
  {
    id: "google_contacts",
    name: "Google Contacts",
    desc: "Auto-create and manage contacts in your Google account.",
    logo: "/assets/icons/tools/google-contacts.png",
    category: "Productivity",
    status: ToolStatus.NOT_CONNECTED,
    active: false,

    authType: AuthType.OAUTH,
    credentials: [
      {
        key: "access_token",
        label: "Access Token",
        placeholder: "ya29.a0AUMWxxxxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN,
      },
      {
        key: "refresh_token",
        label: "Refresh Token",
        placeholder: "1//0gVVXmyRCEykPCgxxxxxxxxxx",
        required: true,
        type: ToolCredentialType.TOKEN,
      },
      {
        key: "expiry_date",
        label: "Expiry Date (timestamp)",
        placeholder: "1770919499790",
        required: true,
        type: ToolCredentialType.TEXT,
      },
      {
        key: "scope",
        label: "Scope",
        placeholder: "https://www.googleapis.com/auth/contacts",
        required: false,
        type: ToolCredentialType.TEXT,
      }
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
    id: "wa_api",
    name: "wa-api.me",
    desc: "Send template, location, media messages via WhatsApp API.",
    category: "Messaging",
    logo: "/assets/icons/tools/wa-api-icon.png",
    status: ToolStatus.NOT_CONNECTED,
    active: false,
    credentials: [
      {
        key: "url",
        label: "API URL",
        placeholder: "https://wa-api.me/api/wa-accounts/messages",
        required: true,
        type: ToolCredentialType.URL
      },
      {
        key: "apiToken",
        label: "Bearer Token",
        placeholder: "wa_live_xxxxxxxxx",
        required: true,
        type: ToolCredentialType.SECRET
      }
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
  }
];

const TOOLS_MAP = new Map(
  TOOLS_LIST.map(tool => [tool.id, tool])
);

export function getToolById(id: string): ToolCatalog | undefined {
  return TOOLS_MAP.get(id);
}