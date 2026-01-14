import { NextResponse } from "next/server";
import { IWallet, WalletModel } from "@/models/Wallet";
import { IMonthlyUsage, MonthlyUsageModel } from "@/models/MonthlyUsage";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { WalletAnalytics } from "@/types/Wallet";

export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
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
        year,
        month,
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
