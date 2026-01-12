import { MessageModel } from "@/models/Message";
import { MessageStatus, STATUS_PRIORITY } from "@/types/MessageType";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";

interface HandleMessageStatusParams {
  statusPayload: any;
}

export async function handleMessageStatus({ statusPayload }: HandleMessageStatusParams) {
  const waMessageId = statusPayload.id;
  const newStatus = statusPayload.status as MessageStatus;
  const statusTime = new Date(Number(statusPayload.timestamp));
  // console.log("statusPayload: " + statusPayload)
  // console.log("waMessageId: " + waMessageId)
  // console.log("status: " + newStatus)

  if (!waMessageId || !newStatus) return;

  // 🔍 Fetch current message first (needed for priority check)
  const existingMessage = await MessageModel.findOne({ waMessageId });
  if (!existingMessage) return;

  const currentStatus = existingMessage.status as MessageStatus;

  // 🛑 PRIORITY CHECK (prevent downgrade / duplicates)
  if (currentStatus && STATUS_PRIORITY[newStatus] < STATUS_PRIORITY[currentStatus]) {
    return; // ignore old or duplicate webhook
  }
  const update: any = {
    status: newStatus,
  };

  if (newStatus === MessageStatus.Sent) {
    update.sentAt = statusTime;
  }

  if (newStatus === MessageStatus.Delivered) {
    update.deliveredAt = statusTime;
  }

  if (newStatus === MessageStatus.Read) {
    update.readAt = statusTime;
  }

  const message = await MessageModel.findOneAndUpdate(
    { waMessageId },
    { $set: update },
    { new: true } // ✅ IMPORTANT
  );

  // handle push notification
  await sendPusherNotification({
    userId: message.userId.toString(),
    event: "message-status-update",
    message: message,
  });
}

// status :{
//   "id": "wamid.HBgMOTE4MjY1ODQ5Mjk4FQIAERgSN0RCMzc2RjJERTY1NkYzOEI1AA==",
//   "status": "sent",
//   "timestamp": "1768207712",
//   "recipient_id": "918265849298",
//   "pricing": {
//     "billable": false,
//     "pricing_model": "PMP",
//     "category": "service",
//     "type": "free_customer_service"
//   }
// }

// status :{
//   "id": "wamid.HBgMOTE4MjY1ODQ5Mjk4FQIAERgSN0RCMzc2RjJERTY1NkYzOEI1AA==",
//   "status": "read",
//   "timestamp": "1768207712",
//   "recipient_id": "918265849298",
//   "pricing": {
//     "billable": false,
//     "pricing_model": "PMP",
//     "category": "service",
//     "type": "free_customer_service"
//   }
// }