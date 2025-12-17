import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data"; // Important for Node
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse;

    const { permanent_token } = waAccount;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "Media file is required" }, { status: 400 });
    }

    // Convert File → Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use Node FormData for multipart upload
    const form = new FormData();
    form.append("file", buffer, { filename: file.name, contentType: file.type });
    form.append("messaging_product", "whatsapp");

    const uploadUrl = `https://graph.facebook.com/v24.0/${waAccount.phone_number_id}/media`;

    const response = await axios.post(uploadUrl, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${permanent_token}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        mediaId: response.data.id, // <-- matches your client code
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.response?.data?.error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
