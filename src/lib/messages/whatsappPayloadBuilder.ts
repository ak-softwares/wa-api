// services/whatsappPayloadBuilder.ts
import { ChatParticipant } from "@/types/Chat";
import {
  MessagePayload,
  MessageType,
  WhatsAppPayload,
} from "@/types/MessageType";
import { injectParticipantVariables } from "../mapping/injectParticipantVariables";
import { TemplatePayload } from "@/types/Template";

interface Params {
  messagePayload: MessagePayload;
  participant: ChatParticipant;
}

export function buildWhatsAppPayload({ messagePayload, participant }: Params): WhatsAppPayload {
  const { messageType, message, media, context, template, location } = messagePayload;

  const to = participant.number;

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
    if (!template) throw new Error("Template payload missing");
    try {
      // console.log("Building template payload:", JSON.stringify(template, null, 2));
      const injectedTemplate: TemplatePayload = injectParticipantVariables({ template: template as TemplatePayload, participant });
      // console.log("Injected template payload:", JSON.stringify(injectedTemplate, null, 2));
      return {
        ...basePayload,
        type: "template",
        template: injectedTemplate,
      };
    } catch (err) {
      throw new Error("Template validation failed");
    }
  }

  // -----------------------------
  // LOCATION MESSAGE
  // -----------------------------
  if (messageType === MessageType.LOCATION) {
    if (!location) throw new Error("Location payload missing");

    return {
      ...basePayload,
      type: "location",
      location,
    };
  }

  throw new Error(`Unsupported message type: ${messageType}`);
}



// Building template payload: {
//   "name": "send_personalised_message",
//   "language": {
//     "code": "en"
//   },
//   "components": [
//     {
//       "type": "BODY",
//       "parameters": [
//         {
//           "type": "TEXT",
//           "text": "{{user_name}}"
//         }
//       ]
//     }
//   ]
// }