// Template Categories
export enum TemplateCategory {
  MARKETING = "MARKETING",
  UTILITY = "UTILITY",
  AUTHENTICATION = "AUTHENTICATION",
}

// Template Status
export enum TemplateStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
}

// All header types
export enum TemplateComponentType {
  HEADER = "HEADER",
  BODY = "BODY",
  FOOTER = "FOOTER",
  BUTTONS = "BUTTONS",
}

// All header formats
export enum TemplateHeaderType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT",
  LOCATION = "LOCATION",
  STICKER = "STICKER",
  AUDIO = "AUDIO",
}

export enum TemplateBodyType {
  TEXT = "TEXT",
}

export enum TemplateFooterType {
  TEXT = "TEXT",
}

export enum TemplateButtonType {
  QUICK_REPLY = "QUICK_REPLY",
  CALL_TO_ACTION = "CALL_TO_ACTION",
  URL = "URL",
  PHONE_NUMBER = "PHONE_NUMBER",
  OTP = "OTP",
  CATALOG = "CATALOG",
  MPM = "MPM",
}

export enum TemplateButtonsParametersType {
  TEXT = "TEXT",
}