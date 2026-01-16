import axios from "axios";
import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import { getFacebookHeaders } from "./helper";
import { ApiError } from "@/types/apiResponse";
import { handleFacebookApiError } from "./handleFacebookApiError";

interface SubscribeAppParams {
  waba_id: string;
  permanent_token: string;
}

// ✅ Subscribe App to WABA
export async function subscribeApp({ waba_id, permanent_token}: SubscribeAppParams) {
  try {
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${waba_id}/subscribed_apps`;

    const fbResponse = await axios.post(url, {}, { headers: getFacebookHeaders(permanent_token) });

    if (fbResponse.data?.success !== true) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Subscription failed: ${fbResponse.data.error.message}`
        : "Subscription failed";

      throw new ApiError(400, errorMessage);
    }
  } catch (error: any) {
    handleFacebookApiError(error, "App subscription failed");
  }
}

// ❌ Unsubscribe App from WABA
export async function unsubscribeApp({
  waba_id,
  permanent_token,
}: SubscribeAppParams): Promise<void> {
  try {
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${waba_id}/subscribed_apps`;

    const fbResponse = await axios.delete(url, {headers: getFacebookHeaders(permanent_token) });

    if (fbResponse.data?.success !== true) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Unsubscription failed: ${fbResponse.data.error.message}`
        : "Unsubscription failed";

      throw new ApiError(400, errorMessage);
    }
  } catch (error: any) {
    handleFacebookApiError(error, "App unsubscription failed");
  }
}
