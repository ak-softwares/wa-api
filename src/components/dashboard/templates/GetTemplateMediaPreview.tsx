"use client";

import React, { useState } from "react";
import { MediaType } from "@/utiles/enums/mediaTypes";

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
   GLOBAL FALLBACK VIEW (Same as MediaMessage)
-----------------------------------------------------*/
function TemplateMediaFallback(mediaType: string, fileName: string) {
  return (
    <div className="-ml-2 -mr-2 -mt-1">
      <div className="w-full h-30 dark:bg-[#1E6549] bg-[#B7E6CD] rounded-md flex items-center justify-center">
        <img src={getMediaIcon(mediaType)} alt="" className="w-15 h-15" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------
   MAIN TEMPLATE MEDIA PREVIEW FUNCTION
-----------------------------------------------------*/
export function TemplateMediaPreview(h: any) {
  const [error, setError] = useState(false);

  const mediaType = h.format; // TEXT | IMAGE | VIDEO | DOCUMENT
  const previewUrl =
    h.example?.header_handle ||
    h.example?.header_url ||
    h.example?.media_url ||
    null;

  const fileName =
    h.example?.filename ||
    h.example?.file_name ||
    "Document";

  /* ---- GLOBAL FALLBACK (matches MediaMessage) ---- */
  if (!previewUrl || error) {
    return TemplateMediaFallback(mediaType, fileName);
  }

  /* ---------------- IMAGE ---------------- */
  if (mediaType === "IMAGE") {
    return (
      <div className="-ml-2 -mr-2 -mt-1">
        <img
          src={previewUrl}
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
          className="rounded-md w-full max-h-48"
          onError={() => setError(true)}
        >
          <source src={previewUrl} />
        </video>
      </div>
    );
  }

  /* ---------------- DOCUMENT ---------------- */
  if (mediaType === "DOCUMENT") {
    return TemplateMediaFallback(mediaType, fileName);
  }

  return null;
}
