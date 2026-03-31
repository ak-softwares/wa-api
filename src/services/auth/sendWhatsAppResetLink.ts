import { MessagePayload, MessageType } from "@/types/MessageType";
import { TemplateButtonsParametersType, TemplateButtonType, TemplateComponentType } from "@/utiles/enums/template";
import axios from "axios";

interface Params {
  phone: string;
  resetTokenFullParam: string;
}

export async function sendWhatsAppResetLink({
  phone,
  resetTokenFullParam,
}: Params): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.WA_API_TOKEN) {
      return {
        success: false,
        message: "WA API token is missing in environment variables",
      };
    }

    const url = "https://wa-api.me/api/wa-accounts/messages/";

    const payload: MessagePayload = {
      participants: [{"number": phone}],
      messageType: MessageType.TEMPLATE,
      template: {
        name: "reset_password_link",
        language: {
          code: "en"
        },
        components: [
          {
            type: TemplateComponentType.BUTTON,
            sub_type: TemplateButtonType.URL,
            index: "0",
            parameters: [
              {
                type: TemplateButtonsParametersType.TEXT,
                text: resetTokenFullParam
              }
            ]
          }
        ]
      }
    };

    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    if (res.status === 200) {
      return {
        success: true,
        message: "Reset link sent on WhatsApp successfully",
      };
    }

    return {
      success: false,
      message: "Unexpected response from WhatsApp API",
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Failed to send reset password link to WhatsApp",
    };
  }
}

