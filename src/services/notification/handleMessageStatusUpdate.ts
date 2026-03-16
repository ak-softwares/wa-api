import { sendWebNotification } from "./sendWebNotification";
import { INotificationPayload } from "@/types/Notification";

interface HandleMessageStatusUpdateParams {
  notificationPayload: INotificationPayload;
}

export function handleMessageStatusUpdate({
  notificationPayload,
}: HandleMessageStatusUpdateParams) {
  void sendWebNotification({ notificationPayload });
}