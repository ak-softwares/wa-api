import { IMessage } from "@/models/Message";
import { MessageType } from "@/types/MessageType";
import { MediaType } from "@/utiles/enums/mediaTypes";

interface Params {
  message: IMessage;
}

export function messageToAIText({ message }: Params): string | null {
  const type = message.type;

  switch (type) {
    /* -------------------------
       Text
    ------------------------- */
    case MessageType.TEXT:
      return message.message?.trim() || null;

    /* -------------------------
       Template
    ------------------------- */
    case MessageType.TEMPLATE:
      return message.template?.name
        ? `Template message: ${message.template.name}`
        : "Template message";

    /* -------------------------
       Location
    ------------------------- */
    case MessageType.LOCATION:
      return "[User shared location]";

    /* -------------------------
       Media
    ------------------------- */
    case MessageType.MEDIA: {
      const caption = message.media?.caption?.trim();

      switch (message.media?.mediaType) {
        case MediaType.IMAGE:
          return caption || "[Image]";

        case MediaType.VIDEO:
          return caption || "[Video]";

        case MediaType.DOCUMENT:
          return "[Document]";

        case MediaType.AUDIO:
          return "[Audio message]";

        default:
          return "[Media]";
      }
    }

    /* -------------------------
       Sticker
    ------------------------- */
    case MessageType.STICKER:
      return "[Sticker]";

    default:
      return null;
  }
}
