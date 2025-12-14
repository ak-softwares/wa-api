export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  AUDIO = "AUDIO",
}

export interface Media {
  id?: string;       // media_id from WhatsApp
  link?: string;     // public URL
  caption?: string;  // only for image/video/document
  filename?: string; // only for document
  mediaType?: MediaType;
  voice?: boolean;
}

export const MEDIA_MIME_TYPES: Record<MediaType, string[]> = {
  [MediaType.IMAGE]: ["image/jpeg", "image/png", "image/webp"],
  [MediaType.VIDEO]: ["video/mp4", "video/mpeg", "video/quicktime"],
  [MediaType.DOCUMENT]: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  [MediaType.AUDIO]: ["audio/mpeg", "audio/wav", "audio/ogg"],
};

export const MEDIA_EXTENSIONS: Record<MediaType, string[]> = {
  [MediaType.IMAGE]: ["jpg", "jpeg", "png", "webp"],
  [MediaType.VIDEO]: ["mp4", "mpeg", "mov"],
  [MediaType.DOCUMENT]: ["pdf", "doc", "docx", "xls", "xlsx"],
  [MediaType.AUDIO]: ["mp3", "wav", "ogg"],
};
