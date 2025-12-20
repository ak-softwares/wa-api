import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/apiResponse";
import { testSendToAIAgent } from "@/lib/ai/webhookService";
import { fetchAuthenticatedUser } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    // Parse request body
    const body = await req.json();
    const webhookUrl = body?.webhookUrl;

    if (!webhookUrl) {
      const response: ApiResponse = { success: false, message: "Webhook URL is required" };
      return NextResponse.json(response, { status: 400 });
    }

    // Test webhook
    const result = await testSendToAIAgent(webhookUrl);

    const response: ApiResponse = {
      success: result.success,
      message: result.message,
      data: result.data,
    };

    return NextResponse.json(response, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error testing webhook: ${error?.message || "Unknown error"}`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}
