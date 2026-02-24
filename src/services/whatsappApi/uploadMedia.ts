import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";
import { handleFacebookApiError } from "./handleFacebookApiError";
import { ApiError } from "@/types/apiResponse";

interface UploadMediaParams {
  phone_number_id: string;
  permanent_token: string;
  file: File;
}

interface UploadMediaResponse {
  mediaId: string;
}

export async function uploadMediaToFacebook({
  phone_number_id,
  permanent_token,
  file,
}: UploadMediaParams): Promise<UploadMediaResponse> {
  try {
    const uploadUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${phone_number_id}/media`;

    const uploadForm = new FormData();
    uploadForm.append("messaging_product", "whatsapp");
    uploadForm.append("file", file, file.name);

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${permanent_token}`,
      },
      body: uploadForm,
    });

    const data = await uploadResponse.json();

    if (!uploadResponse.ok || !data?.id) {
      const message = data?.error?.error_user_msg || data?.error?.message || "Media upload failed";
      throw new ApiError(uploadResponse.status || 500, message);
    }

    return {
      mediaId: data.id,
    };
  } catch (error: any) {
    return handleFacebookApiError(error, "Media upload failed");
  }
}