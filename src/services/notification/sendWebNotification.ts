import { pusher } from "@/lib/pusher";
import { INotificationPayload } from "@/types/Notification";
import { PusherEvent } from "@/utiles/enums/notification";

interface SendWebNotificationParams {
  notificationPayload: INotificationPayload;
}

export async function sendWebNotification({ notificationPayload }: SendWebNotificationParams) {

  const channelName = `user-${notificationPayload.message?.userId.toString()}`;
  const eventName = PusherEvent.USER_EVENT;

  await pusher.trigger(channelName, eventName, { notificationPayload });
}
