// app/api/send-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDefaultWaAccount } from "@/lib/apiHelper/getDefaultWaAccount";
import { Chat } from "@/models/Chat";
import { IMessage } from "@/types/Message";
import { ITemplate } from "@/types/Template";
import { sendTemplateMessage } from "@/lib/messages/sendTemplateMessage";
import { TemplateComponentType } from "@/utiles/enums/template";
import { ApiResponse } from "@/types/apiResponse";

export async function POST(req: NextRequest) {
  try {
    const { user, waAccount, errorResponse } = await getDefaultWaAccount();
    if (errorResponse) return errorResponse;

    const { phone_number_id, permanent_token } = waAccount;

    const body = await req.json();
    const { chatId, template }: { chatId: string; template: ITemplate } = body;

    if (!chatId || !template) {
      return NextResponse.json({ success: false, message: "Missing required fields: chatId, template" }, { status: 400 });
    }

    // Basic template validation
    if (!template.name || !template.language) {
      return NextResponse.json({ success: false, message: "Template must include name and language" }, { status: 400 });
    }

    // Fetch chat
    const chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
      return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
    }

    // Call your unified sender
    const { newMessages, errorResponse: templateError } = await sendTemplateMessage({
      userId: user._id,
      chat: chat,
      phone_number_id,
      permanent_token,
      participants: chat.participants || [],
      template: template,
    });

    if (templateError) return templateError;

    const messages = newMessages as IMessage[];
    const success = Array.isArray(messages) && messages.length > 0;

    const bodyComponent = template.components?.find(
      (c) => c.type === TemplateComponentType.BODY
    );

    chat.lastMessage = bodyComponent?.text || "Template Message";
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json({ success, message: success ? "Template message sent successfully" : "Template message failed", data: messages }, { status: success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}` }, { status: 500 });
  }
}
