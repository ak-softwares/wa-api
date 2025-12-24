// components/chat/MediaMessage.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Message } from "@/types/Message";
import { formatRichText } from "@/components/common/FormatRichText";
import { MediaType } from "@/utiles/enums/mediaTypes";
import { fetchMediaBlob } from "@/services/message/media.service";

interface MediaMessageProps {
  message: Message;
}

export default function MediaMessage({ message }: MediaMessageProps) {

  const mediaId = message.media?.id || null;
  const mediaType = message.media?.mediaType || "";

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [error, setError] = useState(false); // ✅ track load errors

  useEffect(() => {
    if (!mediaId) return;
    const load = async () => {
      const url = await fetchMediaBlob(mediaId);
      setMediaUrl(url);
    };
    load();
  }, [mediaId]);

  const getMediaIcon = () => {
    switch (mediaType) {
        case MediaType.IMAGE:
        return "/assets/icons/camera.svg";
        case MediaType.VIDEO:
        return "/assets/icons/image.svg";
        case MediaType.AUDIO:
        return "/assets/icons/audio.svg";
        default:
        return "/assets/icons/document-icon.svg";
    }
  };

  // ---------------- GLOBAL FALLBACK ----------------
  if (!mediaUrl || error) {
    const fileName = message.media?.filename || "";
    return (
        <div className="max-w-70 max-h-64 mb-2 -mx-2 -mt-1">
            <div className="w-70 h-35 dark:bg-[#1E6549] bg-[#B7E6CD] rounded-md flex items-center justify-center">
                <img src={getMediaIcon()} alt="" className="w-15 h-15"/>
            </div>
            <p className="ml-1">
                {fileName}
            </p>
        </div>
    );
  }

  // ---------------- RENDER IMAGE ----------------
  if (mediaType == MediaType.IMAGE) {
    return (
      <div className="mb-2 -mx-2 -mt-1">
        <img
          src={mediaUrl || "/placeholder.png"}
          alt="image-message"
          className="rounded-md max-w-70 max-h-64 object-cover"
          onError={() => setError(true)} // fallback if load fails
        />
      </div>
    );
  }

  // ---------------- RENDER VIDEO ----------------
  if (mediaType == MediaType.VIDEO) {
    return (
      <div className="mb-2 -mx-2 -mt-1">
        <video
          className="rounded-md max-w-70 max-h-64"
          controls
          onError={() => setError(true)} // fallback if load fails
        >
          <source src={mediaUrl || ""} />
        </video>
      </div>
    );
  }

  // ---------------- RENDER Audio ----------------
  if (mediaType == MediaType.AUDIO) {
    return (
      <div className="mb-2 -mx-2 -mt-1">
        <audio
          className="rounded-md max-w-70 max-h-64"
          controls
          onError={() => setError(true)} // fallback if load fails
        >
          <source src={mediaUrl || ""} />
        </audio>
      </div>
    );
  }

  // ---------------- RENDER DOCUMENT ----------------
  if (mediaType == MediaType.DOCUMENT) {
    const fileName = message.media?.filename || "";
    const isPDF =
        (mediaUrl && mediaUrl.toLowerCase().endsWith(".pdf")) ||
        fileName.toLowerCase().endsWith(".pdf");

    // ----- PDF PREVIEW -----
    if (isPDF) {
        const cleanUrl = `${mediaUrl}#toolbar=0`;
        return (
            <div className="mb-2 -mx-2 -mt-1">
                <div className="max-w-70 max-h-64 rounded-md overflow-hidden">
                    <iframe
                    src={cleanUrl}
                    className="max-w-70 max-h-64 rounded-md no-scrollbar"
                    onError={() => setError(true)} // fallback if load fails
                    />
                </div>
                <p className="ml-1">
                    {fileName}
                </p>
            </div>
        );
    }

    // ----- OTHER DOCUMENTS -----
    return (
        <div className="max-w-70 max-h-64 mb-2 -mx-2 -mt-1">
            <div className="w-70 h-35 rounded-md dark:bg-[#1E6549] bg-[#B7E6CD] flex items-center justify-center">
                <img src="/assets/icons/document-icon.svg" alt="" className="w-15 h-15"/>
            </div>
            <p className="ml-1">
                {fileName}
            </p>
        </div>
    );
  }


  // ---------------- FALLBACK TEXT MESSAGE ----------------
  return (
    <div>
        <p
            className="text-sm whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: formatRichText(message.message || "") }}
        ></p>
    </div>

  );
}