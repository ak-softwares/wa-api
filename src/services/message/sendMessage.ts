import { convertToMetaSendTemplate } from "@/lib/mapping/convertToMetaSendTemplate";
import { MessagePayload, MessageType } from "@/types/MessageType";
import { Template } from "@/types/Template";

// Send a WhatsApp message via Cloud API and save in DB
interface SendMessageOptions {
  messagePayload: MessagePayload;
}

export async function sendMessage({
  messagePayload,
}: SendMessageOptions) {
  if (messagePayload.messageType === MessageType.TEMPLATE && messagePayload.template) {
    // console.log("Sending message payload:", messagePayload);
    const convertedTemplate = convertToMetaSendTemplate({ template: messagePayload.template! as Template });
    // console.log("Converted template:", convertedTemplate);
    messagePayload.template = convertedTemplate;
  }

  const res = await fetch("/api/whatsapp/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messagePayload),
  });

  let data;

  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to send message");
  }
  return data.data.message;
}
