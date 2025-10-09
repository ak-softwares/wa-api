import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import Contact from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const searchQuery = searchParams.get("q") || "";
    const perPage = Math.min(parseInt(searchParams.get("per_page") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * perPage;

    let chats: any[] = [];
    let totalChats = 0;

    const contacts = await Contact.find({ userId: user._id }).lean();

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
        Chat.find({ userId: user._id })
          .sort({ lastMessageAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean(),
        Chat.countDocuments({ userId: user._id }),
      ]);
    }

    // 🔹 If phone is provided → ensure chat exists / prepend temp chat
    if (phone) {
      let chatIndex = chats.findIndex((c) => c.participants.includes(phone));
      let chatWithPhone;

      if (chatIndex !== -1) {
        chatWithPhone = chats.splice(chatIndex, 1)[0];
      } else {
        chatWithPhone = await Chat.findOne({
          userId: user._id,
          participants: { $in: [phone] },
        }).lean();
      }

      if (!chatWithPhone) {
        chatWithPhone = {
          _id: `temp-${phone}`,
          userId: user._id,
          participants: [phone],
          lastMessage: null,
          lastMessageAt: null,
          isTemp: true,
        };
      }

      const contact = contacts.find((c) => c.phones.includes(phone));
      (chatWithPhone as any).participants = (chatWithPhone as any).participants.map((p: string) => ({
        id: p,
        name: p === phone && contact ? contact.name : p,
      }));

      chats = [chatWithPhone as any, ...chats];
    }

    // 🔹 Attach names from contacts
    chats = chats.map((chat) => {
      if (chat.participants[0]?.name) return chat;
      const participants = chat.participants.map((p: string) => {
        const contact = contacts.find((c) => c.phones.includes(p));
        return { id: p, name: contact?.name || p };
      });
      return { ...chat, participants };
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
