import { MessageModel } from "@/models/Message";
import { MessageStatus, STATUS_PRIORITY } from "@/types/MessageType";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";

interface HandleMessageStatusParams {
  statusPayload: any;
}

export async function handleMessageStatus({ statusPayload }: HandleMessageStatusParams) {
  const waMessageId = statusPayload.id;
  const incomingStatus = statusPayload.status as MessageStatus;
  const statusTime = new Date(Number(statusPayload.timestamp));
  // console.log("statusPayload: " + statusPayload)
  // console.log("waMessageId: " + waMessageId)
  // console.log("status: " + incomingStatus)

  if (!waMessageId || !incomingStatus) return;

  // 🔍 Fetch current message first (needed for priority check)
  const existingMessage = await MessageModel.findOne({ waMessageId });
  if (!existingMessage) return;

  const update: any = {};

  if (incomingStatus === MessageStatus.Sent && !existingMessage.sentAt) {
    update.sentAt = statusTime;
  }

  if (incomingStatus === MessageStatus.Delivered && !existingMessage.deliveredAt) {
    update.deliveredAt = statusTime;
  }

  if (incomingStatus === MessageStatus.Read && !existingMessage.readAt) {
    update.readAt = statusTime;
  }

  if (incomingStatus === MessageStatus.Failed && !existingMessage.failedAt) {
    update.failedAt = statusTime;
  }

  const lastStatus = existingMessage.status as MessageStatus;

  const shouldUpdateStatus = !lastStatus || STATUS_PRIORITY[incomingStatus] > STATUS_PRIORITY[lastStatus];

  if (shouldUpdateStatus) {
    update.status = incomingStatus;
  }

  // If nothing to update, skip DB write
  if (Object.keys(update).length === 0) return;

  const message = await MessageModel.findOneAndUpdate(
    { waMessageId },
    { $set: update },
    { new: true } // ✅ IMPORTANT
  );

  if (!message) return;

  // handle push notification
  if (shouldUpdateStatus) {
    await sendPusherNotification({
      userId: message.userId.toString(),
      event: "message-status-update",
      message: message,
    });
  }
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

