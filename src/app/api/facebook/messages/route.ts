import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/messageStatus";
import { MessageType } from "@/types/messageType";
import Contact from "@/models/Contact";
import { ApiResponse } from "@/types/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      const response: ApiResponse = { success: false, message: "Unauthorized" };
      return NextResponse.json(response, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      const response: ApiResponse = { success: false, message: "User not found" };
      return NextResponse.json(response, { status: 404 });
    }

    // Extract query params (?contactId=... or ?limit=...)
    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("contactId");
    const limit = parseInt(searchParams.get("limit") || "20"); // default 20 latest messages

    let query: any = { userId: user._id };
    if (contactId) query.contactId = contactId;

    // Populate contact info
    const messages = await Message.find(query)
      .sort({ createdAt: -1 }) // latest first
      .limit(limit)
      .populate("contactId", "phones lastMessage lastMessageAt");

    const response: ApiResponse = {
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${
        error?.response?.data ? JSON.stringify(error.response.data) : error.message
      }`,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    await connectDB();
    const user = await User.findOne({ email });

    if (!user || !user.waAccounts)
      return NextResponse.json(
        { success: false, message: "No WA account found for this user" },
        { status: 404 }
      );

    const { phone_number_id, permanent_token } = user.waAccounts;
    if (!phone_number_id || !permanent_token)
      return NextResponse.json(
        { success: false, message: "User WA account not configured properly" },
        { status: 400 }
      );

    // Parse request body
    const { to, message } = await req.json();
    if (!to || !message)
      return NextResponse.json(
        { success: false, message: "Missing required fields: phone, message" },
        { status: 400 }
      );

    // WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/v23.0/${phone_number_id}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: message },
    };
    const headers = {
      Authorization: `Bearer ${permanent_token}`,
      "Content-Type": "application/json",
    };

    // Call API
    const fbResponse = await axios.post(url, payload, { headers });

    // Find or create contact
    let contact = await Contact.findOne({ userId: user._id, phone: { $in: [to] } });
    if (!contact) contact = await Contact.create({ userId: user._id, phone: [to] });

    // Message handling
    if (fbResponse.data?.messages?.[0]?.id) {
      const newMessage = {
        userId: user._id,
        contactId: contact._id,
        to,
        from: phone_number_id,
        message,
        waMessageId: fbResponse.data.messages[0].id,
        status: MessageStatus.Sent,
        type: MessageType.Text,
      };
      await Message.create(newMessage);

      contact.lastMessage = message;
      contact.lastMessageAt = new Date();
      await contact.save();

      return NextResponse.json(
        { success: true, message: "Message sent successfully" },
        { status: 200 }
      );
    } else {
      const newMessage = {
        userId: user._id,
        contactId: contact._id,
        to,
        from: phone_number_id,
        message,
        status: MessageStatus.Failed,
        type: MessageType.Text,
      };
      await Message.create(newMessage);

      return NextResponse.json(
        {
          success: false,
          message:
            "Failed to send message" +
            (fbResponse.data?.error?.message
              ? `: ${fbResponse.data.error.message}`
              : ""),
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: `Error: ${
          error?.response?.data ? JSON.stringify(error.response.data) : error.message
        }`,
      },
      { status: 500 }
    );
  }
}
