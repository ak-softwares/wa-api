"use client";

import { useState } from "react";
import { TemplateHeaderType } from "@/utiles/enums/template";

export type UploadedTemplateMedia = {
  file: File | null;
  fileName: string;
  previewUrl: string | null;
  headerHandle: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isValidDocument = (file: File) =>
  [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ].some((type) => file.type.includes(type));

export function useTemplateMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadTemplateMedia = async (
    file: File,
    headerFormat: TemplateHeaderType
  ): Promise<{ headerHandle: string; previewUrl: string }> => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 5MB");
    }

    if (headerFormat === TemplateHeaderType.IMAGE && !file.type.startsWith("image/")) {
      throw new Error("Please select an image file");
    }

    if (headerFormat === TemplateHeaderType.VIDEO && !file.type.startsWith("video/")) {
      throw new Error("Please select a video file");
    }

    if (headerFormat === TemplateHeaderType.DOCUMENT && !isValidDocument(file)) {
      throw new Error("Please select a valid document (PDF, Excel, Word)");
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/wa-accounts/templates/upload-media", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to upload media");
      }

      const headerHandle = data?.data?.header_handle;

      if (!headerHandle) {
        throw new Error("Invalid media upload response");
      }

      return {
        headerHandle,
        previewUrl: URL.createObjectURL(file),
      };
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadTemplateMedia };
}
