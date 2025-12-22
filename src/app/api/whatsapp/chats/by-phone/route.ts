import { NextRequest, NextResponse } from "next/server";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types/apiResponse";
import Contact from "@/models/Contact";
import { IContact } from "@/types/Contact";
import { ChatType, IChat } from "@/types/Chat";

export async function GET(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    // 1️⃣ Missing phone
    if (!phone) {
      const response: ApiResponse = {
        success: false,
        message: "Missing phone number",
        data: null,
      };
      return NextResponse.json(response, { status: 400 });
    }

    let chat = await Chat.findOne({
      userId: user._id,
      waAccountId: waAccount._id,
      participants: { number: phone },
      type: { $ne: ChatType.BROADCAST },
    })
      .lean<IChat>()  // important
      .exec();
    
    if (!chat) {
      chat = await Chat.create({
        userId: user._id,
        waAccountId: waAccount._id,
        participants: [{ number: phone }], // must be object, not string
        type: ChatType.CHAT
      });
    }

    const contact = await Contact.findOne({
      userId: user._id,
      phones: phone,
    })
      .lean<IContact>()  // ⬅️ add type here also
      .exec();


    // Safely update participant
    if (chat?.participants?.[0]) {
      chat.participants[0].name = contact?.name ?? undefined;
      chat.participants[0].imageUrl = contact?.imageUrl ?? undefined;
    }

    // 6️⃣ Final success response
    const response: ApiResponse = {
      success: true,
      message: "Chat found",
      data: {
        chat,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {

    // 7️⃣ Error response (ALWAYS follows ApiResponse)
    const response: ApiResponse = {
      success: false,
      message: error.message || "Internal server error",
      data: null,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
