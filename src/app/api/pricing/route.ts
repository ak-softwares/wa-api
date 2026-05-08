import { NextResponse } from "next/server";
import { PRICING_DATA } from "@/lib/pricing/pricing";
import { ApiResponse } from "@/types/apiResponse";

export async function GET() {
  const response: ApiResponse<typeof PRICING_DATA> = {
    success: true,
    message: "Pricing data fetched successfully",
    data: PRICING_DATA,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
