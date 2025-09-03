import { NextResponse } from "next/server";
import axios from "axios";
import { ApiResponse } from "@/types/apiResponse";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      const response: ApiResponse = {
        success: false,
        message: "Phone is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // ✅ Store OTP (replace with DB/Redis in production)
    globalThis.otpStore = globalThis.otpStore || {};
    globalThis.otpStore[phone] = { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes from now

    // ✅ Send via WhatsApp
    const sent = await sendOtpWhatsApp(phone, otp);

    if (!sent) {
      const response: ApiResponse = {
        success: false,
        message: "Failed to send OTP via WhatsApp",
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse = {
      success: true,
      message: "OTP sent via WhatsApp successfully, Expires at: " + new Date(globalThis.otpStore[phone].expiresAt).toLocaleString(),
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: "Something went wrong: " + (error as Error).message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ✅ Send OTP via WhatsApp (Template Message)
async function sendOtpWhatsApp(phone: string, otp: string): Promise<boolean> {
  try {
    const url = `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const payload1 = {
      messaging_product: "whatsapp",
      to: phone, // must be in full international format (e.g. 9198xxxxxxx)
      type: "template",
      template: {
        name: "otp_authentication", // your approved template name
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: otp,
              },
            ],
          },
          {
            type: "button",
            sub_type: "url",
            index: 0,
            parameters: [
              {
                type: "text",
                text: otp,
              },
            ],
          },
        ],
      },
    };

    const payload = {
        messaging_product: "whatsapp",
        to: phone, // must be in full international format, e.g., "9198xxxxxxx"
        type: "text",
        text: {
            body: `Your OTP is: ${otp}`, // plain text message
        },
    };
    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return res.status === 200;
  } catch (error: any) {
    console.error(
      "WhatsApp API error:",
      error.response?.data || error.message
    );
    return false;
  }
}
