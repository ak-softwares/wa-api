// https://wa-api.me/api/wallet/transactions

import { NextRequest, NextResponse } from "next/server";
import { WalletTransactionModel } from "@/models/WalletTransaction";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ApiResponse } from "@/types/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    // Query params
    const { searchParams } = new URL(req.url);

    const per_page = Math.min(parseInt(searchParams.get("per_page") || "10", 10),100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10),1);

    // Optional filters
    const type = searchParams.get("type"); // WalletTransactionType

    const filter: Record<string, any> = {
      userId: user._id,
    };

    if (type) filter.type = type;

    // Total transactions (for pagination)
    const totalTransactions = await WalletTransactionModel.countDocuments(
      filter
    );

    // Fetch paginated transactions
    const transactions = await WalletTransactionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: "Wallet transactions fetched successfully",
      data: transactions,
      pagination: {
        total: totalTransactions,
        page,
        perPage: per_page,
        totalPages: Math.ceil(totalTransactions / per_page),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error.message
      }`,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
