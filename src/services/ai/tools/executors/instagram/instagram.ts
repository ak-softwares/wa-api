import { ITool } from "@/models/Tool";
import axios from "axios";

type PublishPhotoArgs = {
  image_url: string;
  caption?: string;
};

function getInstagramConfig(tool: ITool) {
  const accessToken = tool.credentials.accessToken?.trim();
  const igUserId = tool.credentials.igUserId?.trim();
  const apiVersion = tool.credentials.apiVersion?.trim() || "v22.0";

  if (!accessToken || !igUserId) {
    throw new Error("Instagram tool is not configured. Missing accessToken or igUserId.");
  }

  return {
    accessToken,
    igUserId,
    baseUrl: `https://graph.facebook.com/${apiVersion}`,
  };
}

export async function publish_photo(args: PublishPhotoArgs, tool: ITool) {
  const { image_url, caption } = args;

  if (!image_url?.trim()) {
    throw new Error("image_url is required.");
  }

  const { accessToken, igUserId, baseUrl } = getInstagramConfig(tool);

  const createRes = await axios.post(
    `${baseUrl}/${igUserId}/media`,
    {
      image_url,
      caption,
      access_token: accessToken,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const creationId = createRes.data?.id;
  if (!creationId) {
    throw new Error("Failed to create Instagram media container.");
  }

  const publishRes = await axios.post(
    `${baseUrl}/${igUserId}/media_publish`,
    {
      creation_id: creationId,
      access_token: accessToken,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return {
    success: true,
    creation_id: creationId,
    media_id: publishRes.data?.id,
  };
}
