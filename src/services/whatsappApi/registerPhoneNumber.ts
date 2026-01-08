import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import axios from "axios";
import { getFacebookHeaders } from "./helper";
import { ApiError } from "@/types/apiResponse";
import { handleFacebookApiError } from "./handleFacebookApiError";

// Register WhatsApp phone number
interface RegisterPhoneNumberParams {
  phone_number_id: string;
  permanent_token: string;
  pin: string;
}

export async function registerPhoneNumber({ phone_number_id, permanent_token, pin }: RegisterPhoneNumberParams) {
  try {
    if (!pin) {
      throw new ApiError(400, "PIN is required");
    }
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${phone_number_id}/register`;
    const payload = { messaging_product: "whatsapp", pin };

    const fbResponse = await axios.post(url, payload, { headers: getFacebookHeaders(permanent_token) });
    if (fbResponse.data?.success !== true) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Registration failed: ${fbResponse.data.error.message}`
        : "Registration failed";
      throw new ApiError(400, errorMessage);
    }
  } catch (error: any) {
    handleFacebookApiError(error, "Phone number registration failed");
  } 
}

// Deregister WhatsApp phone number
interface DeRegisterPhoneNumberParams {
  phone_number_id: string;
  permanent_token: string;
}

export async function deregisterPhoneNumber({ phone_number_id, permanent_token }: DeRegisterPhoneNumberParams) {
  try {
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${phone_number_id}/deregister`;
    const fbResponse = await axios.post(url, { headers: getFacebookHeaders(permanent_token) });
    if (fbResponse.data?.success !== true) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Deregistration failed: ${fbResponse.data.error.message}`
        : "Deregistration failed";
      throw new ApiError(400, errorMessage);
    }
  } catch (error: any) {
    handleFacebookApiError(error, "Phone number deregistration failed");
  } 
}
