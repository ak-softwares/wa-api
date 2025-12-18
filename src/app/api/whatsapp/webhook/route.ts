import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { IUser } from "@/types/User";
import { User } from "@/models/User";
import { IWaAccount } from "@/types/WaAccount";
import { WaAccount } from "@/types/WaAccount";
import { isChatOpen } from "@/lib/activeChats";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { getOrCreateChat } from "@/lib/webhook-helper/getOrCreateChat";
import { handleIncomingMessage } from "@/lib/webhook-helper/handleIncomingMessage";
import { IChat } from "@/types/Chat";
import { Chat } from "@/models/Chat";
import { handleAIMessage } from "@/lib/webhook-helper/handleAIMessage";


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
        const wa: IWaAccount | null = user.waAccounts?.find(
          (acc: WaAccount) => acc.phone_number_id === phone_number_id) ?? null;
        if (!wa) continue;

        // Local cache for chats to reduce DB calls
        const chatCache = new Map<string, IChat>();
        
        for (const msg of messages) {
          const from = msg.from;
          const messageText = msg.text?.body || "";
          if (!from) continue;

          // Get or create chat using cache
          const chat: IChat | null = await getOrCreateChat({
            userId: user._id,
            waAccountId: wa._id!,
            phone: from,
            chatCache,
          });

          if (!chat) {
            // console.error("❌ Skipping message because chat creation failed");
            continue; // prevent crash
          }

          const newMessage = await handleIncomingMessage({
            userId: user._id,
            chatId: chat._id!,
            phone_number_id,
            rowMessageJson: msg,
          })


          // handle lastMessage and unreadCount
          const updateFields: Partial<IChat> = {
            lastMessage: messageText,
            lastMessageAt: new Date(),
          };

          // Only update unreadCount if chat isn't open
          if (!isChatOpen(user._id.toString(), chat._id!.toString())) {
            updateFields.unreadCount = (chat.unreadCount || 0) + 1;
          }

          await Chat.updateOne({ _id: chat._id }, { $set: updateFields });

          // handle push notification
          await sendPusherNotification({
            userId: user._id.toString(),
            event: "new-message",
            chat,
            message: newMessage,
          });
          
          // handle Ai logics
          await handleAIMessage({
            userId: user._id.toString(),
            wa,
            chat,
            change,
            rowMessageJson: msg
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
