import { NextRequest, NextResponse } from "next/server";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { PaymentHistoryModel } from "@/models/PaymentHistory";
import { ApiResponse } from "@/types/apiResponse";
import { PaymentStatus } from "@/types/PaymentHistory";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "10", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const status = searchParams.get("status") as PaymentStatus | null;

    const filter: Record<string, unknown> = { userId: user._id };
    if (status) filter.status = status;

    const total = await PaymentHistoryModel.countDocuments(filter);
    const history = await PaymentHistoryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: "Subscription payment history fetched successfully",
      data: history,
      pagination: {
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
