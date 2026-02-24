import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";

interface Config {
  phone_number_id: string;
  permanent_token: string;
}

export class MediaModule {
  private phone_number_id: string;
  private token: string;

  constructor(config: Config) {
    this.phone_number_id = config.phone_number_id;
    this.token = config.permanent_token;
  }

  /**
   * Upload media to WhatsApp
   */
  async upload(file: File) {
    if (file.size > 16 * 1024 * 1024) {
      throw new Error("File too large");
    }

    const url = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${this.phone_number_id}/media`;

    const form = new FormData();
    form.append("messaging_product", "whatsapp");
    form.append("file", file, file.name);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Upload failed");
    }

    return data.id;
  }

  /**
   * Get temporary media URL from Meta
   */
  async getMediaUrl(mediaId: string): Promise<string> {
    const res = await fetch(
      `https://graph.facebook.com/${FB_GRAPH_VERSION}/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok || !data?.url) {
      throw new Error(data?.error?.message || "Failed to retrieve media URL");
    }

    return data.url;
  }

  /**
   * Download media (buffer + content type)
   */
  async download(mediaId: string): Promise<{
    buffer: ArrayBuffer;
    contentType: string;
  }> {
    const url = await this.getMediaUrl(mediaId);

    const mediaRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!mediaRes.ok) {
      throw new Error("Failed to download media");
    }

    const buffer = await mediaRes.arrayBuffer();
    const contentType = mediaRes.headers.get("Content-Type") || "application/octet-stream";

    return { buffer, contentType };
  }
}