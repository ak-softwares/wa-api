import { sendMobileNotification } from "./sendMobileNotification";
import { sendWebNotification } from "./sendWebNotification";
import { INotificationPayload } from "@/types/Notification";

interface HandlePushNotificationParams {
  notificationPayload: INotificationPayload;
}

export function handlePushNotification({
 notificationPayload,
}: HandlePushNotificationParams) {

  void Promise.allSettled([
    sendWebNotification({ notificationPayload }),
    sendMobileNotification({ notificationPayload }),
  ]);
}
