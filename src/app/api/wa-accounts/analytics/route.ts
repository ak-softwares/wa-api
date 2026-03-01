import { NextRequest, NextResponse } from "next/server";
import { MessageModel } from "@/models/Message";
import { AiUsageModel } from "@/models/AiUsage";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { AnalyticsData } from "@/types/Analytics";
import { MessageStatus } from "@/types/MessageType";
import { MESSAGE_TAGS } from "@/utiles/enums/messageTags";

export async function POST(req: NextRequest) {
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

    // ============================================================
    // ✅ 1 Query: All message stats in one aggregation
    // ============================================================
    const [msgStats] = await MessageModel.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: start, $lte: end },

          // Only messages belonging to this WA account (incoming/outgoing)
          $or: [
            { from: waAccount.phone_number_id },
            { to: waAccount.phone_number_id },
          ],
        },
      },
      {
        $group: {
          _id: null,

          totalMessages: { $sum: 1 },
          apiSentMessages: {
            $sum: {
              $cond: [{ $eq: ["$from", waAccount.phone_number_id] }, 1, 0],
            },
          },
          fbAcceptedMessages: {
            $sum: {
              $cond: [{ $ifNull: ["$sentAt", false] }, 1, 0],
            },
          },
          deliveredMessages: {
            $sum: {
              $cond: [{ $ifNull: ["$deliveredAt", false] }, 1, 0],
            },
          },
          readMessages: {
            $sum: {
              $cond: [{ $ifNull: ["$readAt", false] }, 1, 0],
            },
          },
          failedMessages: {
            $sum: {
              $cond: [{ $eq: ["$status", MessageStatus.Failed] }, 1, 0],
            },
          },
          aIReplies: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$from", waAccount.phone_number_id] },
                    {
                      $in: ["$tag", [MESSAGE_TAGS.AI_ASSISTANT, MESSAGE_TAGS.AI_AGENT]],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalMessages: 1,
          apiSentMessages: 1,
          fbAcceptedMessages: 1,
          deliveredMessages: 1,
          readMessages: 1,
          failedMessages: 1,
          aIReplies: 1,
        },
      },
    ]);

    // ============================================================
    // ✅ 2nd Query: AI usage cost
    // ============================================================
    const [aiStats] = await AiUsageModel.aggregate([
      {
        $match: {
          userId: user._id,
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$totalCost" },
        },
      },
      { $project: { _id: 0, totalCost: 1 } },
    ]);

    const data: AnalyticsData = {
      totalMessages: msgStats?.totalMessages ?? 0,
      apiSentMessages: msgStats?.apiSentMessages ?? 0,
      fbAcceptedMessages: msgStats?.fbAcceptedMessages ?? 0,
      deliveredMessages: msgStats?.deliveredMessages ?? 0,
      readMessages: msgStats?.readMessages ?? 0,
      aIReplies: msgStats?.aIReplies ?? 0,
      failedMessages: msgStats?.failedMessages ?? 0,
      aICost: aiStats?.totalCost ?? 0,
    };

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
