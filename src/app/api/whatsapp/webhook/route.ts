import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { IUser } from "@/types/User";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { IWaAccount } from "@/types/WaAccount";
import { Message } from "@/models/Message";
import { MessageStatus } from "@/types/MessageStatus";
import { MessageType } from "@/types/MessageType";
import { pusher } from "@/lib/pusher";
import { getAIReply } from "@/lib/ai/aiService";
import { sendToAIAgent } from "@/lib/ai/webhookService";
import { WaAccount } from "@/types/WaAccount";
import { isChatOpen } from "@/lib/activeChats";
import { sendWhatsAppMessage } from "@/lib/messages/sendWhatsAppMessage";

const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN; // secret token

// --------------------------------------------------------
// GET (Webhook verification)
// --------------------------------------------------------
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === WA_VERIFY_TOKEN) {
    return NextResponse.json(Number(challenge) || challenge || "OK");
  }

  return NextResponse.json({ success: false, message: "Verification failed" }, { status: 403 });
}

// --------------------------------------------------------
// POST (Receive incoming WhatsApp messages)
// --------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();

    const entries = body.entry ?? [];

    for (const entry of entries) {
      const changes = entry.changes ?? [];

      for (const change of changes) {
        const value = change.value;
        const phone_number_id = value?.metadata?.phone_number_id;
        const messages = value?.messages ?? [];
        if (!phone_number_id || messages.length === 0) continue;

        // Find user only once per entry
        const user: IUser | null = await User.findOne({ "waAccounts.phone_number_id": phone_number_id });
        if (!user) continue;
        const wa: IWaAccount | null = user.waAccounts?.find((acc: WaAccount) => acc.phone_number_id === phone_number_id) ?? null;
        if (!wa) continue;

        // Local cache for chats to reduce DB calls
        const chatCache = new Map<string, any>();

        for (const msg of messages) {
          const from = msg.from;
          const messageText = msg.text?.body || "";
          const waMessageId = msg.id;
          if (!from) continue;

          // Get or create chat using cache
          let chat = chatCache.get(from);
          if (!chat) {
            chat =
              (await Chat.findOne({
                userId: user._id,
                waAccountId: wa._id,
                participants: { $elemMatch: { number: from } },
                type: { $ne: "broadcast" },
              })) ||
              (await Chat.create({
                userId: user._id,
                waAccountId: wa._id,
                participants: [{ number: from }],
                type: "single",
              }));

            chatCache.set(from, chat);
          }

          // Save incoming message and update chat
          const newMessagePromise = Message.create({
            userId: user._id,
            chatId: chat._id,
            to: phone_number_id,
            from,
            message: messageText,
            waMessageId,
            status: MessageStatus.Received,
            type: MessageType.Text,
          });

          // AI handling logic
          if (wa.aiAgent?.isActive && wa.aiAgent?.webhookUrl) {
            await sendToAIAgent({
              webhookUrl: wa.aiAgent.webhookUrl,
              payload: msg, // only single message payload
            });
          } else if (wa.aiChat?.isActive) {
            const aiReply = await getAIReply(wa.aiChat?.prompt ?? "", chat, phone_number_id);
            if (aiReply) {
              const { newMessage, waMessageId, errorResponse: sendMsgError } = await sendWhatsAppMessage({
                userId: user._id.toString(),
                chatId: chat._id,
                phone_number_id,
                permanent_token: wa.permanent_token,
                to: from,
                message: aiReply,
              });
            }
          }

          // Update chat meta data
          chat.lastMessage = messageText;
          chat.lastMessageAt = new Date();
          if (!isChatOpen(user._id.toString(), chat._id.toString())) {
            // Only increase unread count if the chat isn't currently open for this user
            chat.unreadCount = (chat.unreadCount || 0) + 1;
          }
          const saveChatPromise = chat.save();

          // Wait for both write ops
          const newMessage = await newMessagePromise;
          await saveChatPromise;

          // ✅ trigger message for specific user (for listener)
          await pusher.trigger(`user-${user._id.toString()}`, "new-message", {
            chat: chat, // ✅ include the full chat object
            message: newMessage,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Messages processed" }, { status: 200 });
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






// Received message: {
//   "object": "whatsapp_business_account",
//   "entry": [
//     {
//       "id": "0",
//       "changes": [
//         {
//           "field": "messages",
//           "value": {
//             "messaging_product": "whatsapp",
//             "metadata": {
//               "display_phone_number": "16505551111",
//               "phone_number_id": "123456123"
//             },
//             "contacts": [
//               {
//                 "profile": {
//                   "name": "test user name"
//                 },
//                 "wa_id": "16315551181"
//               }
//             ],
//             "messages": [
//               {
//                 "from": "16315551181",
//                 "id": "ABGGFlA5Fpa",
//                 "timestamp": "1504902988",
//                 "type": "text",
//                 "text": {
//                   "body": "this is a text message"
//                 }
//               }
//             ]
//           }
//         }
//       ]
//     }
//   ]
// }