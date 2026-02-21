import { NextRequest, NextResponse } from "next/server";
import { ChatModel, IChat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ChatParticipant } from "@/types/Chat";
import { getOrCreateChat } from "@/services/apiHelper/getOrCreateChat";
import { ITEMS_PER_PAGE, MAX_ITEMS_PER_PAGE } from "@/utiles/constans/apiConstans";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount(req);
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { searchParams } = new URL(req.url);
    const pageParam = Number(searchParams.get("page"));
    const perPageParam = Number(searchParams.get("per_page"));
    const page = Math.max(pageParam || 1, 1);
    const perPage  = Math.min(Math.max(perPageParam || ITEMS_PER_PAGE, 1), MAX_ITEMS_PER_PAGE);
    const skip = (page - 1) * perPage;
    const searchQuery = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";

    let chats: IChat[] = [];
    let totalChats = 0;

    if (searchQuery) {
      // 🔹 Use Atlas Search
      const searchPipeline: any[] = [
        {
          $search: {
            index: "default",
            text: {
              query: searchQuery,
              path: {
                wildcard: "*", // search across all fields
              },
            },
          },
        },
        {
          $match: {
            userId: user._id,
            waAccountId: waAccount._id,
          },
        },
        {
          $sort: {
            lastMessageAt: -1,
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: perPage }],
          },
        },
      ];

      const [searchResult] = await ChatModel.aggregate(searchPipeline);
      chats = searchResult?.data || [];
      totalChats = searchResult?.metadata?.[0]?.total || 0;
    } else {
      const matchConditions: any = {
        userId: user._id,
        waAccountId: waAccount._id,
      };

      if (filter === "unread") {
        matchConditions.unreadCount = { $gt: 0 };
      }

      if (filter === "favourite") {
        matchConditions.isFavourite = true;
      }

      if (filter === "broadcast") {
        matchConditions.type = "broadcast";
      }

      const [searchResult] = await ChatModel.aggregate([
        { $match: matchConditions },
        {
          $addFields: {
            sortDate: { $ifNull: ["$lastMessageAt", "$createdAt"] }, // 👈 fallback
          },
        },
        { $sort: { sortDate: -1 } },
        { $skip: skip },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: skip }, { $limit: perPage }],
          },
        },
      ]);
      chats = searchResult?.data || [];
      totalChats = searchResult?.metadata?.[0]?.total || 0;
    }

    const response: ApiResponse = {
      success: true,
      message: searchQuery ? "Chats searched successfully" : "Chats fetched successfully",
      data: chats,
      pagination: {
        total: totalChats,
        page,
        perPage,
        totalPages: Math.ceil(totalChats / perPage),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    // 📦 Parse request
    const body = await req.json();
    const participant: ChatParticipant = body.participant;

    // 1️⃣ Missing phone
    if (!participant.number) {
      const response: ApiResponse = { success: false, message: "Missing phone number" };
      return NextResponse.json(response, { status: 400 });
    }

    // Get or create chat using cache
    const chat: IChat | null = await getOrCreateChat({
      userId: user._id,
      waAccountId: waAccount._id!,
      participant: participant,
    });

    // 6️⃣ Final success response
    const response: ApiResponse = {
      success: true,
      message: "Chat found",
      data: chat,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    const response: ApiResponse = { success: false, message: error.message || "Internal server error" };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // ✅ Authenticated user
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    // 🔐 Optional safety confirmation (recommended)
    const confirm = req.headers.get("x-confirm-delete-all");
    if (confirm !== "true") {
      const response: ApiResponse = {
        success: false,
        message: "Confirmation required to delete all chats",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Delete ALL chats for this user + WA account
    const result = await ChatModel.deleteMany({
      userId: user._id,
      waAccountId: waAccount._id,
    });

    if (result.deletedCount === 0) {
      const response: ApiResponse = {
        success: false,
        message: "No chats found to delete",
      };
      return NextResponse.json(response, { status: 200 });
    }

    const response: ApiResponse = {
      success: true,
      message: `${result.deletedCount} chat(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    const response: ApiResponse = {
      success: false,
      message: err?.message || "Unexpected error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
