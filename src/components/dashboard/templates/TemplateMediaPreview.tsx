"use client";

import React, { useEffect, useState } from "react";
import { fetchMediaBlob } from "@/services/message/media.service";
import { TemplateHeaderComponentCreate } from "@/types/Template";

/* ----------------------------------------------------
   ICON HANDLER (Same as MediaMessage)
-----------------------------------------------------*/
function getMediaIcon(mediaType: string) {
  switch (mediaType) {
    case "IMAGE":
      return "/assets/icons/camera.svg";
    case "VIDEO":
      return "/assets/icons/image.svg";
    case "LOCATION":
      return "/assets/icons/location-icon.svg";
    default:
      return "/assets/icons/document-icon.svg";
  }
}

/* ----------------------------------------------------
   FALLBACK VIEW
-----------------------------------------------------*/
function TemplateMediaFallback({ mediaType }: { mediaType: string }) {
  return (
    <div className="-ml-2 -mr-2 -mt-1">
      <div className="w-full h-30 dark:bg-[#1E6549] bg-[#B7E6CD] rounded-md flex items-center justify-center">
        <img src={getMediaIcon(mediaType)} alt="" className="w-15 h-15" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   LOADING VIEW
-----------------------------------------------------*/
function TemplateMediaLoading() {
  return (
    <div className="-ml-2 -mr-2 -mt-1">
      <div className="w-full h-32 rounded-md bg-[#B7E6CD] dark:bg-[#1E6549] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      </div>
    </div>
  );
}



/* ----------------------------------------------------
   MAIN MEDIA PREVIEW
-----------------------------------------------------*/
export default function TemplateMediaPreview({ h }: { h: TemplateHeaderComponentCreate }) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const mediaType = h.format; // IMAGE | VIDEO | DOCUMENT
  const mediaIdOrUrl = h?.example?.header_handle?.[0] ?? null;

  const isUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  /* ---------------- LOAD MEDIA ---------------- */
  useEffect(() => {
    if (!mediaIdOrUrl) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        if (isUrl(mediaIdOrUrl)) {
          setMediaUrl(mediaIdOrUrl);
        } else {
          const url = await fetchMediaBlob(mediaIdOrUrl);
          setMediaUrl(url);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [mediaIdOrUrl]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <TemplateMediaLoading />;
  }

  /* ---------------- FALLBACK ---------------- */
  if (!mediaUrl || error) {
    return (
      <TemplateMediaFallback mediaType={mediaType} />
    );
  }

  /* ---------------- IMAGE ---------------- */
  if (mediaType === "IMAGE") {
    return (
      <div className="-ml-2 -mr-2 -mt-1">
        <img
          src={mediaUrl}
          className="rounded-md w-full max-h-48 object-cover"
          alt="template-image"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  /* ---------------- VIDEO ---------------- */
  if (mediaType === "VIDEO") {
    return (
      <div className="-ml-2 -mr-2 -mt-1 bg-black rounded-md">
        <video
          controls
          className="rounded-md w-full max-h-48"
          onError={() => setError(true)}
        >
          <source src={mediaUrl} />
        </video>
      </div>
    );
  }

  /* ---------------- DOCUMENT ---------------- */
  if (mediaType === "DOCUMENT") {
    return (
      <div className="-ml-2 -mr-2 -mt-1">
        <div className="w-60 h-30 dark:bg-[#1E6549] bg-[#B7E6CD] rounded-md flex items-center justify-center">
          <img src={getMediaIcon(mediaType)} alt="" className="w-15 h-15" />
        </div>
      </div>
    );
  }

  return null;
}
