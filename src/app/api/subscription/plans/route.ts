import { NextResponse } from "next/server";
import { PLAN_CONFIG } from "@/config";
import { ApiResponse } from "@/types/apiResponse";

export async function GET() {
  const response: ApiResponse<typeof PLAN_CONFIG> = {
    success: true,
    message: "Plans fetched successfully",
    data: PLAN_CONFIG,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}