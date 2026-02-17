import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { handleSendMessage } from "@/services/message/handleSendMessage";
import { checkMessageCreditsAvailability } from "@/services/wallet/checkMessageCreditsAvailability";
import { ApiResponse } from "@/types/apiResponse";
import { ChatParticipant } from "@/types/Chat";
import { MessagePayload, MessageType } from "@/types/MessageType";
import { TemplatePayload } from "@/types/Template";
import { TemplateBodyType, TemplateButtonsParametersType, TemplateButtonType, TemplateComponentType } from "@/utiles/enums/template";
import { NextRequest, NextResponse } from "next/server";
const DEFAULT_AUTH_OTP_TEMPLATE = "auth_otp";
const DEFAULT_AUTH_OTP_LANGUAGE = "en";

type OtpPayload = {
  number: string;
  code: string;
  templateName?: string;
  language?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Parse request body
    const otpPayload: OtpPayload = await req.json();

    const number = otpPayload.number?.trim();
    const code = otpPayload.code?.trim();
    const templateName = otpPayload.templateName?.trim() || DEFAULT_AUTH_OTP_TEMPLATE;
    const language = otpPayload.language?.trim() || DEFAULT_AUTH_OTP_LANGUAGE;

    if (!number || !code) {
      const response: ApiResponse = {
        success: false,
        message: "number and code are required",
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    const chatParticipant: ChatParticipant = {
      number
    }

    const templatePayload: TemplatePayload = {
      name: templateName,
      language: {
        code: language
      },
      components: [
        {
          type: TemplateComponentType.BODY,
          parameters: [
            {
              type: TemplateBodyType.TEXT,
              text: code
            }
          ]
        },
        {
          type: TemplateComponentType.BUTTON,
          sub_type: TemplateButtonType.URL,
          index: "0",
          parameters: [
            {
              type: TemplateButtonsParametersType.TEXT,
              text: code
            }
          ]
        }
      ]
    }

    const messagePayload: MessagePayload = {
      participants: [chatParticipant],
      messageType: MessageType.TEMPLATE,
      template: templatePayload  
    }

    const result = await handleSendMessage({
      messagePayload,
      userId: user._id,
      waAccount
    });
   
    const response: ApiResponse = {
      success: true,
      message: "Messages send successfully",
      data: result,
    };
    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message || "Failed sending messages"
    };
    return NextResponse.json(response, { status: error.statusCode || 500 });
  }
}