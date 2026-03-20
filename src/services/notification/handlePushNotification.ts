import { sendMobileNotification } from "./sendMobileNotification";
import { INotificationPayload } from "@/types/Notification";

interface HandlePushNotificationParams {
  notificationPayload: INotificationPayload;
}

export function handlePushNotification({
 notificationPayload,
}: HandlePushNotificationParams) {

  void Promise.allSettled([
    sendMobileNotification({ notificationPayload }),
  ]);
}
