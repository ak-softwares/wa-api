import { NextResponse } from "next/server";
import { MessageModel } from "@/models/Message";
import { AiUsageModel } from "@/models/AiUsage";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { AnalyticsData } from "@/types/Analytics";
import { MessageStatus } from "@/types/MessageType";
import { MESSAGE_TAGS } from "@/utiles/enums/messageTags";

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
    const totalMessages = await MessageModel.countDocuments({
      userId: user._id,
      from: waAccount.phone_number_id,     // messages sent FROM this WA account
      createdAt: { $gte: start, $lte: end }
    });

    // Total sent messages (only those sent BY user)
    const apiSentMessages = await MessageModel.countDocuments({
        userId: user._id,
        from: waAccount.phone_number_id,     // messages sent FROM this WA account
        status: { $in: [MessageStatus.Sent, MessageStatus.Delivered, MessageStatus.Read] },
        createdAt: { $gte: start, $lte: end }
    });

    const fbAcceptedMessages = await MessageModel.countDocuments({
      userId: user._id,
      from: waAccount.phone_number_id, // outgoing messages only
      sentAt: { $exists: true },       // ✅ webhook-confirmed
      createdAt: { $gte: start, $lte: end },
    });

    const deliveredMessages = await MessageModel.countDocuments({
      userId: user._id,
      from: waAccount.phone_number_id,   // outgoing only
      deliveredAt: { $exists: true },    // ✅ webhook-confirmed
      createdAt: { $gte: start, $lte: end },
    });

    const readMessages = await MessageModel.countDocuments({
      userId: user._id,
      from: waAccount.phone_number_id,   // outgoing only
      readAt: { $exists: true },         // ✅ webhook-confirmed
      createdAt: { $gte: start, $lte: end },
    });

    const aIReplies = await MessageModel.countDocuments({
      userId: user._id,
      from: waAccount.phone_number_id, // outgoing only
      tag: { $in: [MESSAGE_TAGS.AI_CHAT, MESSAGE_TAGS.AI_AGENT] },
      createdAt: { $gte: start, $lte: end },
    });

    // 4. AI Cost
    const aiUsage = await AiUsageModel.aggregate([
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

    const aICost = aiUsage.length > 0 ? aiUsage[0].totalCost : 0;

    const data: AnalyticsData = {
      totalMessages,
      apiSentMessages,
      fbAcceptedMessages,
      deliveredMessages,
      readMessages,
      aIReplies,
      aICost,
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
