import axios from "axios";

interface Params {
  phone: string;
  otp: string;
}

export async function sendWhatsAppOtp({
  phone,
  otp,
}: Params): Promise<{ success: boolean; message: string }> {
  try {
    if (!process.env.WA_API_TOKEN) {
      return {
        success: false,
        message: "WA API token is missing in environment variables",
      };
    }

    const url = "https://wa-api.me/api/wa-accounts/messages/send-otp";

    const payload = {
      number: phone,
      code: otp,
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
        message: "OTP sent successfully",
      };
    }

    return {
      success: false,
      message: "Unexpected response from WhatsApp API",
    };
  } catch (error: any) {
    console.error("WhatsApp API error:", error?.response?.data || error.message);

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Failed to send WhatsApp OTP",
    };
  }
}
