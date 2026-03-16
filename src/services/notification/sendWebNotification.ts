import { pusher } from "@/lib/pusher";
import { INotificationPayload } from "@/types/Notification";
import { NotificationEventType } from "@/utiles/enums/notification";

interface SendWebNotificationParams {
  notificationPayload: INotificationPayload;
}

export async function sendWebNotification({ notificationPayload }: SendWebNotificationParams) {

  const channelName = `user-${notificationPayload.message?.userId.toString()}`;
  const eventName = NotificationEventType.NEW_MESSAGE;

  await pusher.trigger(channelName, eventName, { notificationPayload });
}
