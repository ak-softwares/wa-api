import { Types } from "mongoose";
import { 
  TemplateComponentType, 
  TemplateHeaderType, 
  TemplateCategory, 
  TemplateStatus,
  TemplateBodyType,
  TemplateFooterType,
  TemplateButtonType,
  TemplateButtonsParametersType
} from "@/utiles/enums/template";

export interface ITemplate {
  _id: Types.ObjectId;
  id?: string;
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  name: string;
  category: TemplateCategory;
  language: string; // e.g. "en"
  components?: TemplateComponent[];
  status?: TemplateStatus | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type Template = ITemplate;

export type TemplateComponent =
  | TemplateHeaderComponentCreate
  | TemplateBodyComponentCreate
  | TemplateFooterComponentCreate
  | TemplateButtonsComponentCreate;

export interface TemplateHeaderComponentCreate {
  type: TemplateComponentType.HEADER;
  format: TemplateHeaderType;
  text?: string;
  example?: {
    header_text?: string[];
    header_handle?: string[];
  };
}

export interface TemplateHeaderComponentSend {
  type: TemplateComponentType.HEADER;
  parameters: TemplateHeaderParameter[];
}

export type TemplateHeaderParameter =
  | { type: TemplateHeaderType.TEXT; text: string }
  | { type: TemplateHeaderType.IMAGE; image: { link: string } }
  | { type: TemplateHeaderType.DOCUMENT; document: { link: string; filename?: string } }
  | { type: TemplateHeaderType.VIDEO; video: { link: string } }
  | { type: TemplateHeaderType.AUDIO; audio: { link: string } }
  | { type: TemplateHeaderType.LOCATION; location: { latitude: number; longitude: number } }
  | { type: TemplateHeaderType.STICKER; sticker: { link: string } };

export interface TemplateBodyComponentCreate {
  type: TemplateComponentType.BODY;
  text: string;
  add_security_recommendation?: boolean;
  example?: {
    body_text?: string[][];
  };
}

export interface TemplateBodyComponentSend {
  type: TemplateComponentType.BODY;
  parameters: TemplateBodyParameter[];
}

export type TemplateBodyParameter = {
  type: TemplateBodyType.TEXT;
  text: string;
};

export interface TemplateFooterComponentCreate {
  type: TemplateComponentType.FOOTER;
  text: string;
}

export interface TemplateFooterComponentSend {
  type: TemplateComponentType.FOOTER;
  parameters: TemplateFooterParameter[];
}

export type TemplateFooterParameter = {
  type: TemplateFooterType.TEXT;
  text: string;
};

export interface TemplateButtonsComponentCreate {
  type: TemplateComponentType.BUTTONS;
  buttons: TemplateButton[];
}

export type TemplateButton =
  | {
      type: TemplateButtonType.URL;
      text: string;
      url: string;
      example?: [ string ];
    }
  | {
      type: TemplateButtonType.QUICK_REPLY;
      text: string;
    }
  | {
      type: TemplateButtonType.PHONE_NUMBER;
      text: string;
      phone_number: string;
    }
  | {
      type: TemplateButtonType.CALL_TO_ACTION;
      text: string;
      url?: string;
      phone_number?: string;
    }
  | {
      type: TemplateButtonType.OTP;
      text: string;
      otp_type: "COPY_CODE" | "ONE_TAP";
      autofill_text: "Autofill";
      package_name: string;
      signature_hash: string;
  }
  | {
      type: TemplateButtonType.CATALOG;
      text: string;
  }
  | {
      type: TemplateButtonType.MPM;
      text: string;
  };

  export interface TemplateButtonsComponentSend {
    type: TemplateComponentType.BUTTONS;
    sub_type: TemplateButtonType;
    index: string; // WhatsApp uses string index ("0", "1", ...)
    parameters: TemplateButtonsParameter[];
  }

  export type TemplateButtonsParameter = {
    type: TemplateButtonsParametersType.TEXT;
    text: string;
  };
