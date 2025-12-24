// services/whatsappPayloadBuilder.ts
import {
  MessagePayload,
  MessageType,
  WhatsAppPayload,
} from "@/types/MessageType";
import { buildMetaTemplatePayload } from "../mapping/convertTemplateToMeta";

interface HandleSendTextMessageParams {
  messagePayload: MessagePayload;
  participant: string;
}

export function buildWhatsAppPayload({
  messagePayload, participant
}: HandleSendTextMessageParams): WhatsAppPayload {
  const { messageType, message, media, context, template, location } = messagePayload;

  const to = participant;

  if (!to) {
    throw new Error("Recipient number missing");
  }

  const basePayload = {
    messaging_product: "whatsapp" as const,
    to,
    ...(context?.id && {
      context: { message_id: context.id },
    }),
  };

  // -----------------------------
  // TEXT MESSAGE
  // -----------------------------
  if (messageType === MessageType.TEXT) {
    if (!message) throw new Error("Text message missing");

    return {
      ...basePayload,
      type: "text",
      text: { body: message },
    };
  }

  // -----------------------------
  // MEDIA MESSAGE
  // -----------------------------
  if (messageType === MessageType.MEDIA) {
    if (!media) throw new Error("Media payload missing");

    const mediaType = media?.mediaType!.toLowerCase();

    return {
      ...basePayload,
      type: mediaType,
      [mediaType]: {
        id: media.id,
        caption: media.caption,
        filename: media.filename,
      },
    };
  }

  // -----------------------------
  // TEMPLATE MESSAGE
  // -----------------------------
  if (messageType === MessageType.TEMPLATE) {
    if (!template) throw new Error("Template missing");

    const metaTemplate = buildMetaTemplatePayload(template);
    return {
      ...basePayload,
      type: "template",
      template: metaTemplate.template,
    };
  }

  // -----------------------------
  // LOCATION MESSAGE
  // -----------------------------
  if (messageType === MessageType.LOCATION) {
    if (!location) throw new Error("Location missing");

    return {
      ...basePayload,
      type: "location",
      location,
    };
  }

  throw new Error(`Unsupported message type: ${messageType}`);
}
