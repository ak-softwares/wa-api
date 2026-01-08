import { NextRequest, NextResponse } from "next/server";
import { ChatModel } from "@/models/Chat";
import { fetchAuthenticatedUser } from "@/services/apiHelper/getDefaultWaAccount";
import { ChatParticipant, ChatType } from "@/types/Chat";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse; // 🚫 Handles all auth, DB, and token errors
    
    const { id: chatId } = await params;
    if (!chatId) {
        return NextResponse.json({ success: false, message: "chatId is required" }, { status: 400 });
    }

    const { members } = await req.json();   // array of phone numbers

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "Members must be a non-empty array" },
        { status: 400 }
      );
    }

    const chat = await ChatModel.findOne({ _id: chatId, userId: user._id });
    if (!chat) {
        return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
    }

    if (chat.type !== ChatType.BROADCAST) {
      return NextResponse.json(
        { success: false, message: "Only broadcast chats can have members" },
        { status: 400 }
      );
    }

     // Existing members
    const existingNumbers = chat.participants.map((m: ChatParticipant) => m.number);

    // Add only new members
    const newMembers = members.filter(
      (m) => m.number && !existingNumbers.includes(m.number)
    );

    if (newMembers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No new members to add",
      });
    }

    // Merge
    chat.participants = [...chat.participants, ...newMembers];
    await chat.save();

    return NextResponse.json({
      success: true,
      message: "Members added successfully",
      data: chat,
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to add members" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await fetchAuthenticatedUser();
    if (errorResponse) return errorResponse;

    const { id: chatId } = await params;
    if (!chatId) {
      return NextResponse.json(
        { success: false, message: "chatId is required" },
        { status: 400 }
      );
    }

    const { members } = await req.json(); // array of phone numbers

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { success: false, message: "Members must be a non-empty array" },
        { status: 400 }
      );
    }

    const chat = await ChatModel.findOne({ _id: chatId, userId: user._id });
    if (!chat) {
      return NextResponse.json(
        { success: false, message: "Chat not found" },
        { status: 404 }
      );
    }

    if (chat.type !== ChatType.BROADCAST) {
      return NextResponse.json(
        { success: false, message: "Only broadcast chats can remove members" },
        { status: 400 }
      );
    }

    const removeNumbers = members.map((m) => m.number);

    // Filter out removed members
    const updatedParticipants = chat.participants.filter(
      (p: ChatParticipant) => !removeNumbers.includes(p.number)
    );

    if (updatedParticipants.length === chat.participants.length) {
      return NextResponse.json({
        success: false,
        message: "No matching members found to remove",
      });
    }

    chat.participants = updatedParticipants;
    await chat.save();

    return NextResponse.json({
      success: true,
      message: "Members removed successfully",
      data: chat,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to remove members" },
      { status: 500 }
    );
  }
}
