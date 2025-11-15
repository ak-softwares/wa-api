import axios from "axios";

interface SendToAIAgentParams {
  webhookUrl: string;
  payload: any;
}

export const sendToAIAgent = async ({
  webhookUrl,
  payload,
}: SendToAIAgentParams) => {
  if (!webhookUrl) {
    return {
      success: false,
      message: "Webhook URL is required",
    };
  }

  try {
    const body = {
      raw: payload,
    };

    const response = await axios.post(webhookUrl, body, {
      headers: { "Content-Type": "application/json" },
      validateStatus: () => true, // handle all HTTP statuses manually
    });

    if (response.status >= 200 && response.status < 300) {
      return {
        success: true,
        message: "Webhook sent successfully",
        data: response.data || {},
      };
    } else {
      return {
        success: false,
        message: response.data?.message || `Webhook failed with status ${response.status}`,
        data: response.data || {},
      };
    }
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Unknown error sending webhook",
    };
  }
};


// Corrected function
export const testSendToAIAgent = async (webhookUrl: string) => {
  if (!webhookUrl) {
    return {
      success: false,
      message: "Webhook URL is required",
    };
  }
  try {
    const result = await sendToAIAgent({webhookUrl, payload: rawPayload});
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Unknown error",
    };
  }
};

// Sample WhatsApp/Facebook message payload
const rawPayload = {
  value: {
    messaging_product: "whatsapp",
    metadata: {
      display_phone_number: "123456789",
      phone_number_id: "PHONE_NUMBER_ID",
    },
    contacts: [
      {
        profile: {
          name: "Mike Johnson",
        },
        wa_id: "5511777777777",
      },
    ],
    messages: [
      {
        from: "5511777777777",
        id: "wamid.HBgNNTUxMTc3Nzc3Nzc3NwUCABIYFDNBMTk1MkI5M0U4QjZBRTAxRjJDAA==",
        timestamp: "1700000002",
        type: "text",
        text: {
          body: "Forwarded from Facebook: Check out this amazing offer!",
        },
        context: {
          from: "facebook_page_12345",
          id: "mid.$cAABaBvxSJhRThFzrVbUjUuUuUuUuU",
          forwarded: true,
          frequently_forwarded: false,
        },
      },
    ],
  },
  field: "messages",
};
