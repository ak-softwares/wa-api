import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { ApiResponse } from "@/types/apiResponse";
import { MessageStatus } from "@/types/messageStatus";
import { MessageType } from "@/types/messageType";
import { pusher } from "@/lib/pusher";
import { getAIReply, sendMessage } from "@/lib/ai/aiService";
import { sendToAIAgent } from "@/lib/ai/webhookService";

const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN; // secret token

// GET for webhook verification (required by WhatsApp)
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

// POST to receive incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // console.log(`🔹 body.verify_token: ${body.verify_token}`);
    // // Optional verification if included in payload
    // if (body.verify_token && body.verify_token !== WA_VERIFY_TOKEN) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    await connectDB();

    // Example: iterate over incoming messages
    const entries = body.entry || [];

    for (const [i, entry] of entries.entries()) {
      const changes = entry.changes || [];
      for (const [j, change] of changes.entries()) {
        const messages = change.value?.messages || [];
        const phone_number_id = change.value?.metadata?.phone_number_id;
        // const phone_number_id = "810369052154744";

        for (const [k, msg] of messages.entries()) {
          const from = msg.from; // sender
          const messageText = msg.text?.body || "";
          const waMessageId = msg.id;
          // Find user by phone_number_id
          const user = await User.findOne({ "waAccounts.phone_number_id": phone_number_id });
          if (!user) {
            continue;
          }

          // Find or create chat
          let chat = await Chat.findOne({
            userId: user._id,
            participants: {
              $elemMatch: { number: from } // looks inside the participants array
            },
            type: { $ne: "broadcast" } // NOT a broadcast chat
          });

          if (!chat) {
            chat = await Chat.create({
              userId: user._id,
              participants: [{ number: from }], // must be object, not string
              type: "single"
            });
          }

          // Save incoming message
          const newMessage = await Message.create({
            userId: user._id,
            chatId: chat._id,
            to: phone_number_id,
            from,
            message: messageText,
            waMessageId,
            status: MessageStatus.Received,
            type: MessageType.Text,
          });

          // Trigger Pusher event
          await pusher.trigger(`chat-${chat._id}`, "new-message", {
            message: newMessage,
          });

          // --- AUTO-REPLY LOGIC ---
          if(user.aiAgent?.isActive && user.aiAgent?.webhookUrl){
            const result = await sendToAIAgent(
              {webhookUrl: user.aiAgent?.webhookUrl, payload:entry, chatHistory: ""});
        
            // const response: ApiResponse = {
            //   success: result.success,
            //   message: result.message,
            //   data: result.data,
            // };
          }
          else if (user.aiConfig?.isActive) {
            const aiReply = await getAIReply(user.aiConfig.prompt, chat, phone_number_id);
            if (aiReply) {
              await sendMessage(user, chat, from, aiReply);
            }
          }

          // await pusher.trigger("global-notifications", "new-message", {
          //   message: newMessage,
          // });


          // Update chat last message
          chat.lastMessage = messageText;
          chat.lastMessageAt = new Date();
          chat.unreadCount = (chat.unreadCount || 0) + 1;
          await chat.save();
        }
      }
    }

    const response: ApiResponse = { success: true, message: "Messages processed" };
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: `Error: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`,
    };
    return NextResponse.json(response, { status: 500 });
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