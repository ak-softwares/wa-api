import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File is required" },
        { status: 400 }
      );
    }

    const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!;
    const TOKEN = process.env.WA_API_ACCESS_TOKEN!;
    const VERSION = "v24.0"; // change if needed

    const fileName = file.name;
    const fileType = file.type; // image/jpeg or video/mp4
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileLength = fileBuffer.length;

    // ---------------------------------------
    // 1️⃣ INIT UPLOAD SESSION
    // ---------------------------------------
    const initUrl = `https://graph.facebook.com/${VERSION}/${APP_ID}/uploads`;

    const initRes = await axios.post(
      initUrl,
      {},
      {
        params: {
          file_name: fileName,
          file_length: fileLength,
          file_type: fileType,
        },
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        }
      }
    );

    const uploadSessionId = initRes.data.id; // <-- IMPORTANT

    // ---------------------------------------
    // 2️⃣ UPLOAD BINARY FILE
    // ---------------------------------------
    const uploadUrl = `https://graph.facebook.com/${VERSION}/${uploadSessionId}`;

    const uploadRes = await axios.post(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "file_offset": "0",
      }
    });

    // This contains: h (the media handle)
    const result = uploadRes.data;  
    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: {
          header_handle: result.h,      // <-- THIS IS WHAT YOU WANT
        },
      },
      { status: 200 }
    );

  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        message:
          error?.response?.data?.error?.error_user_msg ||
          error?.response?.data?.error?.message ||
          error.message,
      },
      { status: 400 }
    );
  }
}
