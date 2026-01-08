import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import axios from "axios";
import { getFacebookHeaders } from "./helper";
import { ApiError } from "@/types/apiResponse";
import { handleFacebookApiError } from "./handleFacebookApiError";

// Get WhatsApp phone numbers
interface GetPhoneNumbersParams {
  waba_id: string;
  permanent_token: string;
}

export async function getPhoneNumbers({ waba_id, permanent_token }: GetPhoneNumbersParams) {
  try {
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${waba_id}?fields=phone_numbers`;

    const fbResponse = await axios.get(url, {
      headers: getFacebookHeaders(permanent_token),
    });

    if (!fbResponse.data?.phone_numbers) {
      throw new ApiError(400, "Failed to fetch phone numbers");
    }

    return fbResponse.data.phone_numbers?.data || [];
  } catch (error: any) {
    handleFacebookApiError(error, "Fetching phone numbers failed");
  }
}
