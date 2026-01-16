import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import axios from "axios";
import { getFacebookHeaders } from "./helper";
import { ApiError } from "@/types/apiResponse";
import { handleFacebookApiError } from "./handleFacebookApiError";

interface RequestCodeResult {
  success: boolean;
  alreadyVerified: boolean;
  data?: any;
}

// Request WhatsApp verification code
interface RequestCodeParams {
  phone_number_id: string;
  permanent_token: string;
  code_method?: "SMS" | "VOICE"; // optional, defaults to SMS
}

export async function requestVerificationCode({ phone_number_id, permanent_token, code_method = "SMS"}: RequestCodeParams) {
  try {
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${phone_number_id}/request_code`;
    const payload = { language: "en_US", code_method };

    const fbResponse = await axios.post(url, payload, { headers: getFacebookHeaders(permanent_token) });

    if (fbResponse.data?.success !== true) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Request code failed: ${fbResponse.data.error.message}`
        : "Request code failed";
      throw new ApiError(400, errorMessage);
    }

    return {
      success: true,
      alreadyVerified: false,
      data: fbResponse.data,
    };
  } catch (error: any) {
    const errCode = error?.response?.data?.error?.code;
    const errSubCode = error?.response?.data?.error?.error_subcode;

    // ✅ Meta: already verified
    if (errCode === 136024 && errSubCode === 2388091) {
      return {
        success: true,
        alreadyVerified: true,
      };
    }
    handleFacebookApiError(error, "Request verification code failed");
  }
}

// Verify WhatsApp verification code
interface VerifyCodeParams {
  phone_number_id: string;
  permanent_token: string;
  code: string;
}

export async function verifyVerificationCode({ phone_number_id, permanent_token, code }: VerifyCodeParams) {
  try {
    if (!code) {
      throw new ApiError(400, "Verification code is required");
    }

    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${phone_number_id}/verify_code`;
    const payload = { code };

    const fbResponse = await axios.post(url, payload, { headers: getFacebookHeaders(permanent_token) });

    if (fbResponse.data?.success !== true) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Verify code failed: ${fbResponse.data.error.message}`
        : "Verify code failed";
      throw new ApiError(400, errorMessage);
    }

  } catch (error: any) {
    handleFacebookApiError(error, "Verify verification code failed");
  }
}
