"use client";

import { useState } from "react";
import { MediaType, MEDIA_MIME_TYPES, MEDIA_EXTENSIONS } from "@/utiles/enums/mediaTypes";

export const useMedia = () => {
  const [uploading, setUploading] = useState(false);

  // --------------------------------------
  // VALIDATION
  // --------------------------------------
  const validateMedia = (file: File, format: MediaType) => {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!file) return "No file selected";

    // Size
    if (file.size > maxSize) {
      return "File must be less than 5MB";
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const allowedMimeTypes = MEDIA_MIME_TYPES[format];
    const allowedExtensions = MEDIA_EXTENSIONS[format];

    // MIME type check
    if (!allowedMimeTypes.includes(file.type)) {
      return `Invalid ${format.toLowerCase()} file type`;
    }

    // Extension check
    if (!allowedExtensions.includes(ext)) {
      return `${format} must be one of: ${allowedExtensions.join(", ")}`;
    }

    return null; // OK
  };

  // --------------------------------------
  // UPLOAD MEDIA
  // --------------------------------------
  const uploadMedia = async (file: File, format?: MediaType) => {
    
    if(format){
      // Run validation before uploading
      const error = validateMedia(file, format);
      if (error) {
          return { mediaId: null, error };
      }
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/whatsapp/media", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!data.success) return { mediaId: null, error: data.message };

      return { mediaId: data.data.mediaId, error: null };
    } catch (e: any) {
      return { mediaId: null, error: e.message };
    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------
  // FETCH MEDIA BLOB (PREVIEW)
  // --------------------------------------
  const fetchMedia = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/whatsapp/media/${mediaId}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  };

  return { uploadMedia, validateMedia, fetchMedia, uploading };
};
