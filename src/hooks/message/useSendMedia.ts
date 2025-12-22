// hooks/whatsapp/useSendMedia.ts
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Media, MediaType } from "@/utiles/enums/mediaTypes";
import { useMedia } from "../common/useMedia";
import { Types } from "mongoose";
import { MessageStatus } from "@/types/MessageStatus";
import { Message } from "@/types/Message";
import { useMessageStore } from "@/store/messageStore";
import { MessageType } from "@/types/MessageType";

interface SendMediaParams {
  chatId: string;
  file: File;
  caption?: string;
  mediaType: MediaType;
}

interface UseSendMediaReturn {
  sendMedia: (params: SendMediaParams) => Promise<boolean>;
  isSending: boolean;
  progress: number;
}

export function useSendMedia(): UseSendMediaReturn {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const { setAppendMessage } = useMessageStore();
  const { uploadMedia } = useMedia();

  const sendMedia = async ({
    chatId,
    file,
    caption = "",
    mediaType,
  }: SendMediaParams): Promise<boolean> => {
    setIsSending(true);
    setProgress(10);
    const tempMediaPayload: Media = {
      id: "132456",
      caption,
      mediaType,
      filename: mediaType === MediaType.DOCUMENT ? file.name : undefined,
    };
    try {
      const tempId = new Types.ObjectId();
      const tempMessage: Message = {
          _id: tempId,
          userId: "local-user" as any,
          chatId: chatId as any,
          to: "",
          from: "me",
          media: tempMediaPayload,
          status: MessageStatus.Pending,
          type: MessageType.MEDIA,
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      setAppendMessage(tempMessage);
  
      // ---------------------------------------
      // 1) Upload Media to WhatsApp (media API)
      // ---------------------------------------
      const { mediaId, error: uploadErr } = await uploadMedia(file);

      if (uploadErr) throw new Error(uploadErr);
      if (!mediaId) throw new Error("Upload failed");

      setProgress(50);

      // ---------------------------------------
      // 2) Build media object for DB + API
      // ---------------------------------------
      const mediaPayload: Media = {
        id: mediaId,
        caption,
        mediaType,
        filename: mediaType === MediaType.DOCUMENT ? file.name : undefined,
      };

      // ---------------------------------------
      // 3) Send message API
      // ---------------------------------------
      const response = await fetch("/api/whatsapp/messages/send-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          media: mediaPayload,
        }),
      });

      setProgress(90);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to send media");
      }

      const realMessage: Message = result.data[0];
      
      // -------------------------------
      // 4) Replace TEMP with REAL
      // -------------------------------
      setAppendMessage(realMessage, tempId);

      setProgress(100);
      // toast.success("Media sent successfully");
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to send media");
      return false;
    } finally {
      setIsSending(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return { sendMedia, isSending, progress };
}
