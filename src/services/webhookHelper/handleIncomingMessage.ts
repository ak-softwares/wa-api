import { MessageStatus, IncomingMessageType, MessageType } from "@/types/MessageType";
import { MessageModel, IContext, IMessage } from "@/models/Message";
import { Types } from "mongoose";
import { resolveContextMessage } from "./resolveContextMessage";
import { MediaType } from "@/utiles/enums/mediaTypes";

interface handleIncomingMessageArgs {
  userId: Types.ObjectId;
  chatId: Types.ObjectId;
  phone_number_id: string;
  rowMessageJson: any;
}

export async function handleIncomingMessage({
  userId,
  chatId,
  phone_number_id,
  rowMessageJson
}: handleIncomingMessageArgs) {
  const from = rowMessageJson.from;
  let context: IContext | undefined = rowMessageJson.context || undefined;
  const waMessageId = rowMessageJson.id;

  // Resolve context message (if present)
  context = await resolveContextMessage(chatId, context);
  
  let type = rowMessageJson.type;

  // Determine message type and extract content
  let messageData: IMessage = {
    userId,
    chatId,
    to: phone_number_id,
    from,
    waMessageId,
    status: MessageStatus.Received,
    type: MessageType.TEXT,
    context
  };

  switch (type) {
    // -----------------------------
    // TEXT MESSAGE
    // -----------------------------
    case IncomingMessageType.TEXT:
      messageData = {
        ...messageData,
        type: MessageType.TEXT,
        message: rowMessageJson.text.body
      };
      break;

    // -----------------------------
    // IMAGE
    // -----------------------------
    case IncomingMessageType.IMAGE:
      const image = rowMessageJson.image;
      messageData = {
        ...messageData,
        type: MessageType.MEDIA,
        media: {
          id: image.id,
          link: image.url,
          caption: image.caption,
          mediaType: MediaType.IMAGE
        }
      };
      break;
    
    // -----------------------------
    // VIDEO
    // -----------------------------
    case IncomingMessageType.VIDEO:
      const video = rowMessageJson.video;
      messageData = {
        ...messageData,
        type: MessageType.MEDIA,
        media: {
          id: video.id,
          link: video.url,
          caption: video.caption,
          mediaType: MediaType.VIDEO
        }
      };
      break;

    // -----------------------------
    // AUDIO
    // -----------------------------
    case IncomingMessageType.AUDIO:
      const audio = rowMessageJson.audio;
      messageData = {
        ...messageData,
        type: MessageType.MEDIA,
        media: {
          id: audio.id,
          link: audio.url,
          caption: audio.caption,
          mediaType: MediaType.AUDIO,
          voice: audio.voice
        }
      };
      break;

    // -----------------------------
    // DOCUMENT
    // -----------------------------
    case IncomingMessageType.DOCUMENT:
      const document = rowMessageJson.document;
      messageData = {
        ...messageData,
        type: MessageType.MEDIA,
        media: {
          filename: document.filename,
          id: document.id,
          link: document.url,
          caption: document.caption,
          mediaType: MediaType.DOCUMENT
        }
      };
      break;

    // -----------------------------
    // CONTACTS
    // -----------------------------
    case IncomingMessageType.CONTACTS:
      const contacts = rowMessageJson.contacts[0];
      messageData = {
        ...messageData,
        type: MessageType.TEXT,
        message: `${contacts.name.formatted_name} : ${contacts.phones[0].phone}`
      };
      break;
    
    // -----------------------------
    // LOCATION
    // -----------------------------
    case IncomingMessageType.LOCATION:
      const location = rowMessageJson.location;
      messageData = {
        ...messageData,
        type: MessageType.LOCATION,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          name: location.name,
          address: location.address,
        }
      };
      break;

    // -----------------------------
    // DEFAULT / UNSUPPORTED
    // -----------------------------
    default:
      messageData = {
        ...messageData,
        type: MessageType.TEXT,
        message: `Unsupported type: ${type}`
      };
      break;
  }
  
  // Create the message in database
  const createdMessage = await MessageModel.create(messageData);
  return createdMessage;
}

// Received message: {
//   "object": "whatsapp_business_account",
//   "entry": [
//     {
//       "id": "0",
//       "changes": [
//         {
//           "field": "messages",
//           "value": {
//             "messaging_product": "whatsapp",
//             "metadata": {
//               "display_phone_number": "16505551111",
//               "phone_number_id": "123456123"
//             },
//             "contacts": [
//               {
//                 "profile": {
//                   "name": "test user name"
//                 },
//                 "wa_id": "16315551181"
//               }
//             ],
//             "messages": [
//               {
//                 "from": "16315551181",
//                 "id": "ABGGFlA5Fpa",
//                 "timestamp": "1504902988",
//                 "type": "text",
//                 "text": {
//                   "body": "this is a text message"
//                 }
//               }
//             ]
//           }
//         }
//       ]
//     }
//   ]
// }