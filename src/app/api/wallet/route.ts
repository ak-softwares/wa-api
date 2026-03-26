import { NextRequest, NextResponse } from "next/server";
import { IWallet, WalletModel } from "@/models/Wallet";
import { IMonthlyUsage, MonthlyUsageModel } from "@/models/MonthlyUsage";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { WalletAnalytics } from "@/types/Wallet";
import { FREE_MONTHLY_MESSAGES, PRICE_PER_CREDIT_USD } from "@/utiles/constans/wallet";
import { ApiResponse } from "@/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser(req);
    if (errorResponse) return errorResponse;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1–12

    // Wallet (credits)
    const wallet = await WalletModel.findOne({ userId: user._id }).lean<IWallet>();

    const creditBalance: number = wallet?.balance ?? 0;
    
    // Current Month Usage
    const monthlyUsage = await MonthlyUsageModel.findOne({
      userId: user._id,
      year,
      month,
    }).lean<IMonthlyUsage>();

    const currentMonthUsed: number = monthlyUsage?.used ?? 0;

    const data: WalletAnalytics = {
        creditBalance,
        currentMonthUsed,
        freeMonthlyMessages: FREE_MONTHLY_MESSAGES,
        pricePerCreditUSD: PRICE_PER_CREDIT_USD,
        year,
        month,
    }

    const response: ApiResponse = {
      success: true,
      message: "Wallet analytics fetched successfully",
      data,
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
