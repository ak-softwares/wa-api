import { MessagePayload, MessageType } from "@/types/MessageType";
import { MediaType } from "@/utiles/enums/mediaTypes";

export function generateLastMessageText(
  payload: MessagePayload
): string {
  const { messageType, message, media, template } = payload;

  switch (messageType) {
    case MessageType.TEXT:
      return message?.trim() || "Text message";

    case MessageType.LOCATION:
      return "📍 Location";

    case MessageType.STICKER:
      return "😀 Sticker";

    case MessageType.TEMPLATE:
      return template?.name
        ? `📄 Template: ${template.name}`
        : "📄 Template message";

    case MessageType.MEDIA: {
      switch (media?.mediaType) {
        case MediaType.IMAGE:
          return media?.caption?.trim() || "📷 Photo";

        case MediaType.VIDEO:
          return media?.caption?.trim() || "🎥 Video";

        case MediaType.DOCUMENT:
          return "📄 Document";

        case MediaType.AUDIO:
          return "🎵 Audio message";

        default:
          return "📎 Media message";
      }
    }

    default:
      return "New message";
  }
}
