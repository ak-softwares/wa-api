import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions"; // adjust path
import { ApiResponse } from "@/types/apiResponse";
import { testSendToAIAgent } from "@/lib/ai/webhookService";

export async function POST(req: NextRequest) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

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
