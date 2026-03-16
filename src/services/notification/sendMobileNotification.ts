import { getMessagePreview } from "@/lib/messages/getMessagePreview";
import { PushDeviceModel } from "@/models/PushDevice";
import { INotificationPayload } from "@/types/Notification";
import { formatInternationalPhoneNumber } from "@/utiles/formater/formatPhone";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface SendMobileNotificationParams {
  notificationPayload: INotificationPayload;
}

export async function sendMobileNotification({ 
  notificationPayload
 }: SendMobileNotificationParams) {
  const userId = notificationPayload.message?.userId;

  const devices = await PushDeviceModel.find({ userId }).lean();

  if (!devices.length) return;

  const title = formatInternationalPhoneNumber(notificationPayload.message?.from ?? "").international || "New message";
  
  const messages = devices.map((device) => ({
    to: device.token,
    sound: "default",
    title: title,
    body: getMessagePreview(notificationPayload.message),
    data: notificationPayload,
    priority: "high",
  }));

  await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  await PushDeviceModel.updateMany(
    { _id: { $in: devices.map((d) => d._id) } },
    { $set: { updatedAt: new Date() } }
  );
}
