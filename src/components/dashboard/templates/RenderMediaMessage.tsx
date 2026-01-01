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

/* ----------------------------------------------------
   LOADING VIEW
-----------------------------------------------------*/
function MediaLoading() {
  return (
    <div className="-ml-2 -mr-2 -mt-1">
      <div className="w-60 h-32 rounded-md bg-[#B7E6CD] dark:bg-[#1E6549] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function MediaMessage({ message }: MediaMessageProps) {
  const mediaId = message.media?.id || null;
  const mediaType = message.media?.mediaType || "";

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!mediaId) return;

    let isMounted = true;
    setLoading(true);
    setError(false);
    setMediaUrl(null);

    const load = async () => {
      try {
        const url = await fetchMediaBlob(mediaId);
        if (isMounted) {
          setMediaUrl(url);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
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

  // ---------------- LOADING ----------------
  if (loading) {
    return <MediaLoading />;
  }

  // ---------------- GLOBAL FALLBACK ----------------
  if (!mediaUrl || error) {
    const fileName = message.media?.filename || "";
    return (
      <div className="max-w-70 max-h-64 mb-2 -mx-2 -mt-1">
        <div className="w-70 h-35 dark:bg-[#1E6549] bg-[#B7E6CD] rounded-md flex items-center justify-center">
          <img src={getMediaIcon()} alt="" className="w-15 h-15" />
        </div>
        <p className="ml-1">{fileName}</p>
      </div>
    );
  }

  // ---------------- RENDER IMAGE ----------------
  if (mediaType === MediaType.IMAGE) {
    return (
      <div className="mb-2 -mx-2 -mt-1">
        <img
          src={mediaUrl}
          alt="image-message"
          className="rounded-md max-w-70 max-h-64 object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // ---------------- RENDER VIDEO ----------------
  if (mediaType === MediaType.VIDEO) {
    return (
      <div className="mb-2 -mx-2 -mt-1">
        <video
          className="rounded-md max-w-70 max-h-64"
          controls
          onError={() => setError(true)}
        >
          <source src={mediaUrl} />
        </video>
      </div>
    );
  }

  // ---------------- RENDER AUDIO ----------------
  if (mediaType === MediaType.AUDIO) {
    return (
      <div className="mb-2 -mx-2 -mt-1">
        <audio
          className="rounded-md max-w-70 max-h-64"
          controls
          onError={() => setError(true)}
        >
          <source src={mediaUrl} />
        </audio>
      </div>
    );
  }

  // ---------------- RENDER DOCUMENT ----------------
  if (mediaType === MediaType.DOCUMENT) {
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
              onError={() => setError(true)}
            />
          </div>
          <p className="ml-1">{fileName}</p>
        </div>
      );
    }

    // ----- OTHER DOCUMENTS -----
    return (
      <div className="max-w-70 max-h-64 mb-2 -mx-2 -mt-1">
        <div className="w-70 h-35 rounded-md dark:bg-[#1E6549] bg-[#B7E6CD] flex items-center justify-center">
          <img
            src="/assets/icons/document-icon.svg"
            alt=""
            className="w-15 h-15"
          />
        </div>
        <p className="ml-1">{fileName}</p>
      </div>
    );
  }

  // ---------------- FALLBACK TEXT MESSAGE ----------------
  return (
    <div>
      <p
        className="text-sm whitespace-pre-line"
        dangerouslySetInnerHTML={{
          __html: formatRichText(message.message || ""),
        }}
      />
    </div>
  );
}
