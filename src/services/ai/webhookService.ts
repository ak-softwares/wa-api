import axios from "axios";

interface WebhookHandlerParams {
  webhookUrl: string;
  payload: any;
  prompt?: string;
  user_name?: string;
  user_phone?: string;
}

export const webhookHandler = async ({
  webhookUrl,
  payload,
  prompt,
  user_name,
  user_phone,
}: WebhookHandlerParams) => {
  if (!webhookUrl) {
    return {
      success: false,
      message: "Webhook URL is required",
    };
  }
    const finalSystemPrompt = `
${prompt}

The user's name is: ${user_name}. The user's phone is: ${user_phone}.
Use the user's name and user phone naturally in your responses when appropriate.
Do NOT overuse the name.
`;
  try {
    const body = {
      systemPrompt: finalSystemPrompt,
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

