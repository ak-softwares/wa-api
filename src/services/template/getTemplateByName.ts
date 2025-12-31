import { IWaAccount } from "@/models/WaAccount";

interface GetTemplateByNameParams {
  templateName: string;
  waAccount: IWaAccount;
}

export async function getTemplateByName({templateName, waAccount}: GetTemplateByNameParams) {
  if (!templateName) {
    throw new Error("Template name is required");
  }

  const { waba_id, permanent_token } = waAccount;

  const url = `https://graph.facebook.com/v19.0/${waba_id}/message_templates?name=${templateName}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${permanent_token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Meta API error: ${data.error?.message || "Failed to fetch templates"}`
    );
  }

  if (!data.data || data.data.length === 0) {
    throw new Error(`Template '${templateName}' not found in Meta`);
  }

  // Meta always returns array
  const template = data.data[0];

  return template;
}
