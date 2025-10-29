import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Chat } from "@/models/Chat";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/types/apiResponse";
import { WaAccount } from "@/types/WaAccount";

export async function POST(req: NextRequest) {
  try {
    // 🔐 Authenticate user
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = {
        success: false,
        message: "Unauthorized",
      };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const wa = user.waAccounts.find((acc: WaAccount) => acc.default === true);
    if (!wa) {
      const response: ApiResponse = {
        success: false, 
        message: "No active WhatsApp account found",
      };
      return NextResponse.json(response, { status: 404 });
    }
    
    // 📦 Parse request
    const { participants, chatName, chatImage } = await req.json();

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "Participants array is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Create broadcast chat
    const chat = await Chat.create({
      userId: user._id,
      waAccountId: wa._id,
      participants: participants.map((p: any) => ({
        number: String(p.number),
        name: p.name ?? "",
        imageUrl: p.imageUrl ?? "",
      })),
      type: "broadcast",
      chatName: chatName || `Broadcast - ${new Date().toLocaleDateString()}`,
      chatImage: chatImage || "",
    });

    const response: ApiResponse = {
      success: true,
      message: "Broadcast chat created successfully",
      data: chat,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("Error creating broadcast chat:", error);

    const response: ApiResponse = {
      success: false,
      message: error.message || "Internal Server Error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
