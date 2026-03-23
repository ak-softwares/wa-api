import { pusher } from "@/lib/pusher";
import { INotificationPayload } from "@/types/Notification";
import { PusherEvent } from "@/utiles/enums/notification";

interface SendWebNotificationParams {
  eventPayload: INotificationPayload;
}

export async function emitPusherEvent({ eventPayload }: SendWebNotificationParams) {

  const channelName = `user-${eventPayload.message?.userId.toString()}`;
  const eventName = PusherEvent.USER_EVENT;
  await pusher.trigger(channelName, eventName, { eventPayload });
}
