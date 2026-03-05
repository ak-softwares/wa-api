import { FB_GRAPH_VERSION } from "@/utiles/constans/apiConstans";

interface Config {
  app_id: string;
  permanent_token: string;
}

export class UploadModule {
  private appId: string;
  private token: string;

  constructor(config: Config) {
    this.appId = config.app_id;
    this.token = config.permanent_token;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Upload media using Resumable Upload API
   * Returns header handle (h) used in templates
   */
  async upload(file: File): Promise<{
    header_handle: string;
  }> {
    if (!file) throw new Error("File required");

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const fileName = file.name;
    const fileType = file.type;
    const fileLength = fileBuffer.length;

    /* --------------------------------------- */
    /* 1️⃣ INIT UPLOAD SESSION */
    /* --------------------------------------- */

    const initUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${this.appId}/uploads`;

    const initRes = await fetch(
      `${initUrl}?file_name=${encodeURIComponent(
        fileName
      )}&file_length=${fileLength}&file_type=${encodeURIComponent(fileType)}`,
      {
        method: "POST",
        headers: this.headers,
      }
    );

    const initData = await initRes.json();

    if (!initRes.ok) {
      throw new Error(
        initData?.error?.message || "Failed to initialize upload session"
      );
    }

    const uploadSessionId = initData.id;

    /* --------------------------------------- */
    /* 2️⃣ UPLOAD BINARY FILE */
    /* --------------------------------------- */

    const uploadUrl = `https://graph.facebook.com/${FB_GRAPH_VERSION}/${uploadSessionId}`;

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        ...this.headers,
        file_offset: "0",
        "Content-Type": "application/octet-stream",
      },
      body: fileBuffer,
    });

    const uploadData = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadData?.error?.message || "Upload failed");
    }

    return {
      header_handle: uploadData.h,
    };
  }
}