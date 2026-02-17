import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { MessageModel } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";
import { MessageStatus } from "@/types/MessageType";
import { AnalyticsData } from "@/types/Analytics";
import { ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";

export async function GET(req: NextRequest) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse;

    // Extract directly from body
    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page"));
    const perPageParam = Number(searchParams.get("per_page"));
    const page = Math.max(pageParam || 1, 1);
    const perPage  = Math.min(Math.max(perPageParam || ITEMS_PER_PAGE, 1), MAX_ITEMS_PER_PAGE);
    const skip = (page - 1) * perPage;
    const searchQuery = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";

    const chatId = searchParams.get("chatId"); // broadcast chatId
    const messageId = searchParams.get("messageId"); // broadcast master messageId (optional)

    if (!chatId || !messageId) {
      const response: ApiResponse = { success: false, message: "Missing chatId or messageId" };
      return NextResponse.json(response, { status: 400 });
    }

    const chatObjectId = new Types.ObjectId(chatId);
    const masterMessageId = new Types.ObjectId(messageId);

    // ============================================================
    // 1) MATCH REPORT ROWS (each participant message)
    // ============================================================
    const match = {
      userId: user._id,
      chatId: chatObjectId,
      parentMessageId: masterMessageId, // 👈 only rows for that broadcast message
      isBroadcastMaster: false,
    };

    // ============================================================
    // 2) SUMMARY COUNTS (total, fbAccepted, delivered, read)
    // ============================================================
    const summaryAgg = await MessageModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
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
        },
      },
    ]);

    const summary: AnalyticsData = summaryAgg?.[0] || {
      totalMessages: 0,
      fbAcceptedMessages: 0,
      deliveredMessages: 0,
      readMessages: 0,
      failedMessages: 0,
    };

    // ============================================================
    // 3) SEARCH PIPELINE
    // ============================================================
    const pipeline: any[] = [];

    if (searchQuery) {
      pipeline.push({
        $search: {
          index: "default",
          text: {
            query: searchQuery,
            path: {
              wildcard: "*",
            },
          },
        },
      });
    }

    pipeline.push({
      $match: match,
    });

    pipeline.push({
      $sort: { createdAt: -1 },
    });

    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $skip: skip },
          { $limit: perPage },
          {
            $project: {
              _id: 1,
              to: 1,
              waMessageId: 1,
              status: 1,
              sentAt: 1,
              deliveredAt: 1,
              readAt: 1,
              failedAt: 1,
              errorMessage: 1,
              createdAt: 1,
            },
          },
        ],
      },
    });

    // ============================================================
    // EXECUTE PIPELINE
    // ============================================================
    const [result] = await MessageModel.aggregate(pipeline);

    const rows = result?.data || [];
    const total = result?.metadata?.[0]?.total || 0;

    const response: ApiResponse = {
      success: true,
      message: "Broadcast message report fetched successfully",
      data: {
        masterMessageId,
        summary,
        rows,
      },
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
      message: error.message || "Internal Server Error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
