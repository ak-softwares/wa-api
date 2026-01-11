import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { ContactModel } from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("q") || "";
    const filter = searchParams.get("filter") || "all";
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * perPage;

    let chats: any[] = [];
    let totalChats = 0;

    const contacts = await ContactModel.find({ userId: user._id }).lean();

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

      // 🔹 Regular paginated query
      [chats, totalChats] = await Promise.all([
        ChatModel.aggregate([
          { $match: matchConditions },
          {
            $addFields: {
              sortDate: { $ifNull: ["$lastMessageAt", "$createdAt"] }, // 👈 fallback
            },
          },
          { $sort: { sortDate: -1 } },
          { $skip: skip },
          { $limit: perPage },
        ]),
        ChatModel.countDocuments({ userId: user._id, waAccountId: waAccount._id }),
      ]);
    }

    // Map all chats' participants to include name and image
    chats = chats.map((chat: any) => {
      return {
        ...chat,
        participants: chat.participants.map((p: any) => {
          const number = typeof p === "string" ? p : p.number;
          const contact = contacts.find((c) => c.phones.includes(number));

          return {
            number,
            name: contact?.name,
            imageUrl: contact?.imageUrl || (typeof p === "object" ? p.imageUrl : undefined),
          };
        }),
      };
    });

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
