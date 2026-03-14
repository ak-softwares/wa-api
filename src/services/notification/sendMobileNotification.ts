import { Types } from "mongoose";
import { PushDeviceModel } from "@/models/PushDevice";
import { IChat } from "@/models/Chat";
import { IMessage } from "@/models/Message";
import parsePhoneNumberFromString, { CountryCode, formatIncompletePhoneNumber } from "libphonenumber-js";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface SendMobileNotificationParams {
  userId: Types.ObjectId;
  chat?: IChat;
  message?: IMessage;
}

export async function sendMobileNotification({ userId, chat, message }: SendMobileNotificationParams) {
  if (!userId) return;

  const devices = await PushDeviceModel.find({ userId }).lean();

  if (!devices.length) return;

  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  const title = formatPhone(message?.from ?? "") || "New message";
  
  const messages = devices.map((device) => ({
    to: device.token,
    sound: "default",
    title: title,
    body: message?.message || chat?.lastMessage || "You have a new message",
    data: {
      chatId: chat?._id?.toString(),
      messageId: message?._id?.toString(),
    },
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
