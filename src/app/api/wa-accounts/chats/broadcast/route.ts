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
    const { broadcastName, broadcastImage, participants } = await req.json();

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      const response: ApiResponse = { success: false, message: "Participants array is required" };
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
      chatName: broadcastName || `Broadcast - ${new Date().toLocaleDateString()}`,
      chatImage: broadcastImage || "",
    });

    const response: ApiResponse = {
      success: true,
      message: "Broadcast chat created successfully",
      data: chat,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    const response: ApiResponse = { success: false, message: error.message || "Internal Server Error" };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    // 📦 Parse request
    const { broadcastId, broadcastName, broadcastImage, participants } = await req.json();

    if (!broadcastId) {
      const response: ApiResponse = { success: false, message: "broadcastId is required" };
      return NextResponse.json(response, { status: 400 });
    }

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: "Participants array is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // ✅ Find broadcast chat
    const chat = await ChatModel.findOne({
      _id: broadcastId,
      userId: user._id,
      waAccountId: waAccount._id,
      type: ChatType.BROADCAST,
    });

    if (!chat) {
      const response: ApiResponse = {
        success: false,
        message: "Broadcast chat not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // ✅ Update broadcast chat
    chat.chatName = broadcastName?.trim() || chat.chatName;
    chat.chatImage = broadcastImage ?? chat.chatImage;
    chat.participants = participants ?? chat.participants

    await chat.save();

    const response: ApiResponse = {
      success: true,
      message: "Broadcast chat updated successfully",
      data: chat,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = { success: false, message: error.message || "Internal Server Error" };
    return NextResponse.json(response, { status: 500 });
  }
}
