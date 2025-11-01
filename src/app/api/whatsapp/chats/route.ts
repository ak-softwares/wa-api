import { NextRequest, NextResponse } from "next/server";
import { Chat } from "@/models/Chat";
import Contact from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const searchQuery = searchParams.get("q") || "";
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * perPage;

    let chats: any[] = [];
    let totalChats = 0;

    const contacts = await Contact.find({ userId: user._id }).lean();

    // 🔹 If phone is provided → ensure chat exists / prepend temp chat
    if (phone) {
      // Find or create chat
      let chat = await Chat.findOne({
        userId: user._id,
        waAccountId: waAccount._id,
        participants: {
          $elemMatch: { number: phone } // looks inside the participants array
        },
        type: { $ne: "broadcast" } // NOT a broadcast chat
      });

      if (!chat) {
        await Chat.create({
          userId: user._id,
          waAccountId: waAccount._id,
          participants: [{ number: phone }], // must be object, not string
          type: "single"
        });
      }
    }

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

      const [searchResult] = await Chat.aggregate(searchPipeline);
      chats = searchResult?.data || [];
      totalChats = searchResult?.metadata?.[0]?.total || 0;
    } else {
      // 🔹 Regular paginated query
      [chats, totalChats] = await Promise.all([
        Chat.aggregate([
          { $match: { userId: user._id, waAccountId: waAccount._id } },
          {
            $addFields: {
              sortDate: { $ifNull: ["$lastMessageAt", "$createdAt"] }, // 👈 fallback
            },
          },
          { $sort: { sortDate: -1 } },
          { $skip: skip },
          { $limit: perPage },
        ]),
        Chat.countDocuments({ userId: user._id, waAccountId: waAccount._id }),
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
