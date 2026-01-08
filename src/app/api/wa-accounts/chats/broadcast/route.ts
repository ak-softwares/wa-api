import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import { getDefaultWaAccount } from "@/services/apiHelper/getDefaultWaAccount";
import { ChatParticipant, ChatType } from "@/types/Chat";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors

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
    const chat = await ChatModel.create({
      userId: user._id,
      waAccountId: waAccount._id,
      participants: participants.map((participant: ChatParticipant) => ({
        number: participant.number,
        name: participant.name ?? "",
        imageUrl: participant.imageUrl ?? "",
      })),
      type: ChatType.BROADCAST,
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
    const response: ApiResponse = {
      success: false,
      message: error.message || "Internal Server Error",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
