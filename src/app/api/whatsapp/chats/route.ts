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
    const per_page = Math.min(parseInt(searchParams.get("per_page") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);

    // Fetch chats with pagination
    let chats = await Chat.find({ userId: user._id })
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * per_page)
      .limit(per_page)
      .lean();

    const totalChats = await Chat.countDocuments({ userId: user._id });
    const contacts = await Contact.find({ userId: user._id }).lean();

    // 🔹 If phone is provided, fetch or create temp chat
    if (phone) {
      let chatIndex = chats.findIndex((c) => c.participants.includes(phone));
      let chatWithPhone;

      if (chatIndex !== -1) {
        // Existing chat in the fetched list, remove it
        chatWithPhone = chats.splice(chatIndex, 1)[0];
      } else {
        // Check in DB if exists outside pagination
        chatWithPhone = await Chat.findOne({ userId: user._id, participants: { $in: [phone] } }).lean();
      }

      if (!chatWithPhone) {
        // Create temp chat if not exists
        chatWithPhone = {
          _id: `temp-${phone}`,
          userId: user._id,
          participants: [phone],
          lastMessage: null,
          lastMessageAt: null,
          isTemp: true,
        };
      }

      // Attach names to participants
      const contact = contacts.find((c) => c.phones.includes(phone));
      (chatWithPhone as any).participants = (chatWithPhone as any).participants.map((p: string) => ({
        id: p,
        name: p === phone && contact ? contact.name : p,
      }));

      // Prepend to chats
      chats = [(chatWithPhone as any), ...chats];
    }

    // Attach names to other participants
    chats = chats.map((chat) => {
      if (chat.participants[0]?.name) return chat; // already processed phone chat
      const participants = chat.participants.map((p: string) => {
        const contact = contacts.find((c) => c.phones.includes(p));
        return { id: p, name: contact?.name || p };
      });
      return { ...chat, participants };
    });

    const response: ApiResponse = {
      success: true,
      message: "Chats fetched successfully",
      data: chats,
      pagination: {
        total: totalChats,
        page,
        perPage: per_page,
        totalPages: Math.ceil(totalChats / per_page),
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
