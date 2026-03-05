import { NextRequest, NextResponse } from "next/server";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";
import { UploadModule } from "@/services/whatsappApi/modules/UploadModule";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      const response: ApiResponse = {
        success: false,
        message: "File is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID!;
    const TOKEN = process.env.WA_API_ACCESS_TOKEN!;

    const uploadModule = new UploadModule({
      app_id: APP_ID,
      permanent_token: TOKEN,
    });

    const result = await uploadModule.upload(file);

    const response: ApiResponse = {
      success: true,
      message: "File uploaded successfully",
      data: result,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
