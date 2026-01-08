// services/media.service.ts
import { MediaType, MEDIA_MIME_TYPES, MEDIA_EXTENSIONS } from "@/utiles/enums/mediaTypes";

export function validateMedia(file: File, format: MediaType) {
  const maxSize = 5 * 1024 * 1024;

  if (!file) return "No file selected";
  if (file.size > maxSize) return "File must be less than 5MB";

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!MEDIA_MIME_TYPES[format].includes(file.type)) {
    return `Invalid ${format.toLowerCase()} file type`;
  }

  if (!MEDIA_EXTENSIONS[format].includes(ext)) {
    return `${format} must be one of: ${MEDIA_EXTENSIONS[format].join(", ")}`;
  }

  return null;
}

export async function uploadMediaApi(file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/wa-accounts/media", {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message);
  }

  return data.data.mediaId as string;
}

export async function fetchMediaBlob(mediaId: string) {
  const res = await fetch(`/api/wa-accounts/media/${mediaId}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
