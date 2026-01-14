import mongoose from "mongoose";
import { MessageModel } from "@/models/Message";
import { MessageStatus, STATUS_PRIORITY } from "@/types/MessageType";
import { sendPusherNotification } from "@/utiles/comman/sendPusherNotification";
import { debitMessageCredits } from "../wallet/debitMessageCredits";

interface HandleMessageStatusParams {
  statusPayload: any;
}

export async function handleMessageStatus({ statusPayload }: HandleMessageStatusParams) {
  const waMessageId = statusPayload.id;
  const incomingStatus = statusPayload.status as MessageStatus;
  // console.log("statusPayload: " + statusPayload)
  // console.log("waMessageId: " + waMessageId)
  // console.log("status: " + incomingStatus)

  if (!waMessageId || !incomingStatus) return;

  // ✅ WhatsApp timestamp is in SECONDS → convert safely
  const rawTs = Number(statusPayload.timestamp);
  const statusTime = new Date(rawTs < 1e12 ? rawTs * 1000 : rawTs);

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

  if (incomingStatus === MessageStatus.Read) {
    // ✅ Read implies delivered + sent (for analytics)
    if (!existingMessage.sentAt) update.sentAt = statusTime;
    if (!existingMessage.deliveredAt) update.deliveredAt = statusTime;
    if (!existingMessage.readAt) update.readAt = statusTime;
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

  // ✅ Debit credits when message becomes Delivered OR Read (first time only)
  const isSuccessStatus = incomingStatus === MessageStatus.Delivered || incomingStatus === MessageStatus.Read;

  if (isSuccessStatus && !existingMessage.isCreditDebited) {

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        // 🔥 lock debit (prevent double debit)
        const lockedMessage = await MessageModel.findOneAndUpdate(
          {
            waMessageId,
            $or: [
              { isCreditDebited: false },
              { isCreditDebited: { $exists: false } },
            ],
          },
          { $set: { isCreditDebited: true } },
          { new: true, session }
        );

        if (!lockedMessage) return; // already debited by another webhook call

        const cost = 1;

        await debitMessageCredits({ userId: lockedMessage.userId, cost, session});
      });
    } finally {
      session.endSession();
    }
  }

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

