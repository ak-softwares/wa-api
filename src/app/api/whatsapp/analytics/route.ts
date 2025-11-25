import { NextResponse } from "next/server";
import { Message } from "@/models/Message";
import { AiUsage } from "@/models/AiUsage";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function POST(req: Request) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Extract directly from body
    const { start: startDate, end: endDate } = await req.json();
    
    // Final validated dates
    const start = startDate ? new Date(startDate) : firstDayOfMonth;
    const end = endDate ? new Date(endDate) : now;

    // 1. Total messages in the date range
    const totalMessages = await Message.countDocuments({
      userId: user._id,
      createdAt: { $gte: start, $lte: end }
    });

    // 2. Total sent messages (only those sent BY user)
    const totalSentMessages = await Message.countDocuments({
        userId: user._id,
        from: waAccount.phone_number_id,     // messages sent FROM this WA account
        status: { $in: ["sent", "delivered", "read"] },
        createdAt: { $gte: start, $lte: end }
    });

    // 3. Total AI Replies
    const totalAIReplies = await Message.countDocuments({
      userId: user._id,
      tag: "aiChat",
    //   from: waAccount.phone_number_id,   // ensures it's an outgoing AI reply
    //   status: { $in: ["sent", "delivered", "read"] },
      createdAt: { $gte: start, $lte: end }
    });

    // 4. AI Cost
    const aiUsage = await AiUsage.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$totalCost" }
        }
      }
    ]);

    const totalAICost = aiUsage.length > 0 ? aiUsage[0].totalCost : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalMessages,
        totalSentMessages,
        totalAIReplies,
        totalAICost
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
