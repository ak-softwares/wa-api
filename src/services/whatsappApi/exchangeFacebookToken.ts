import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import axios from "axios";
import { ApiError } from "@/types/apiResponse";
import { handleFacebookApiError } from "./handleFacebookApiError";

// Exchange short-lived token for permanent token
interface ExchangeTokenParams {
  access_token: string;
}

export async function exchangeFacebookToken({
  access_token,
}: ExchangeTokenParams) {
  try {
    if (!access_token) {
      throw new ApiError(400, "Access token is required");
    }

    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      code: access_token,
      grant_type: "authorization_code",
    });

    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/oauth/access_token`;

    const fbResponse = await axios.post(url, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!fbResponse.data?.access_token) {
      const errorMessage = fbResponse.data?.error?.message
        ? `Token exchange failed: ${fbResponse.data.error.message}`
        : "Token exchange failed";

      throw new ApiError(400, errorMessage);
    }

    return fbResponse.data.access_token;
  } catch (error: any) {
    handleFacebookApiError(error, "Token exchange failed");
  }
}
