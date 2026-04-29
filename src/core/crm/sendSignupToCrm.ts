import { SignupCrmJobData } from "../../types/Crm";
import { getZohoAccessToken } from "./zohoTokenManager";

const ZOHO_CRM_BASE_URL = process.env.ZOHO_CRM_BASE_URL || "https://www.zohoapis.in";
const ZOHO_CRM_MODULE = process.env.ZOHO_CRM_MODULE || "Leads";

export async function sendSignupToCrm(payload: SignupCrmJobData) {
  const accessToken = await getZohoAccessToken();

const name = payload.name?.trim() || "";
const [firstName, ...lastNameParts] = name.split(/\s+/);

const lastName = lastNameParts.join(" ") || firstName || payload.email;

  const response = await fetch(`${ZOHO_CRM_BASE_URL}/crm/v2/${ZOHO_CRM_MODULE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    },
    body: JSON.stringify({
      data: [
        {
          Last_Name: lastName,
          First_Name: lastNameParts.length ? firstName : undefined,
          Email: payload.email,
          Phone: String(payload.phone),
          Lead_Source: "App Signup",
          Description: `User ID: ${payload.userId}, Signed up at: ${payload.createdAt}`,
        },
      ],
      trigger: ["workflow"],
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `CRM request failed with status ${response.status}: ${responseText}`,
    );
  }
}
