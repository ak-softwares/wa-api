import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import axios from "axios";
import { getFacebookHeaders } from "./helper";
import { ApiError } from "@/types/apiResponse";
import { handleFacebookApiError } from "./handleFacebookApiError";
import { IWabaAccount } from "@/models/WaAccount";

// Get WhatsApp phone numbers
interface GetPhoneNumbersParams {
  waba_id: string;
  permanent_token: string;
}

export async function getWabaDetails({ waba_id, permanent_token }: GetPhoneNumbersParams): Promise<IWabaAccount> {
  try {
    const WABA_FIELDS ="phone_numbers,id,name,currency,account_review_status,message_template_namespace";
    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${waba_id}`;

    const fbResponse = await axios.get(url, {
      headers: getFacebookHeaders(permanent_token),
      params: { fields: WABA_FIELDS },
    });

    if (!fbResponse.data?.id) {
      throw new ApiError(400, "Failed to fetch WABA details");
    }

    // ✅ Map Graph response -> Custom response
    const mapped: IWabaAccount = {
      id: fbResponse.data.id,
      name: fbResponse.data.name,
      currency: fbResponse.data.currency,
      account_review_status: fbResponse.data.account_review_status as any,
      message_template_namespace: fbResponse.data.message_template_namespace,
      phone_numbers: fbResponse.data.phone_numbers?.data || [],
    };

    return mapped;
  } catch (error: any) {
    return handleFacebookApiError(error, "Fetching Waba Details failed");
  }
}
