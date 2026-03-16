import { IMessage } from "@/models/Message";
import { Message } from "@/types/Message";
import { MessageType } from "@/types/MessageType";
import { MediaType } from "@/utiles/enums/mediaTypes";

function truncateText(text?: string, limit = 60): string {
  if (!text) return "";
  const trimmed = text.trim();
  return trimmed.length > limit ? trimmed.slice(0, limit) + "…" : trimmed;
}

export function getMessagePreview(message?: IMessage | Message | null): string {
  if (!message) return "New message";

  const { type: messageType, message: messageText, media, template } = message;

  switch (messageType) {
    case MessageType.TEXT:
      return truncateText(messageText) || "Text message";

    case MessageType.LOCATION:
      return "📍 Location";

    case MessageType.STICKER:
      return "😀 Sticker";

    case MessageType.TEMPLATE:
      return template?.name
        ? truncateText(`📄 Template: ${template.name}`)
        : "📄 Template message";

    case MessageType.MEDIA: {
      switch (media?.mediaType) {
        case MediaType.IMAGE:
          return truncateText(media?.caption) || "📷 Photo";

        case MediaType.VIDEO:
          return truncateText(media?.caption) || "🎥 Video";

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