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

export type Template = {
  _id: string;
  id?: string;
  userId: string;
  waAccountId: string;
  name: string;
  category: TemplateCategory;
  language: string; // e.g. "en"
  components?: TemplateComponentCreate[];
  status?: TemplateStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export type TemplatePayload = {
  name: string;
  language: { code: string };
  components?: TemplateComponentSend[];
}

export type TemplateComponentCreate =
  | TemplateHeaderComponentCreate
  | TemplateBodyComponentCreate
  | TemplateFooterComponentCreate
  | TemplateButtonsComponentCreate;

export type TemplateComponentSend =
  | TemplateHeaderComponentSend
  | TemplateBodyComponentSend
  | TemplateFooterComponentSend
  | TemplateButtonsComponentSend;

export type TemplateHeaderComponentCreate = {
  type: TemplateComponentType.HEADER;
  format: TemplateHeaderType;
  text?: string;
  example?: {
    header_text?: string[];
    header_handle?: string[];
  };
}

export type TemplateHeaderComponentSend = {
  type: TemplateComponentType.HEADER;
  parameters: TemplateHeaderParameter[];
}

export type TemplateHeaderParameter =
  | { type: TemplateHeaderType.TEXT; text: string }
  | { type: TemplateHeaderType.IMAGE; image: { link?: string, id?: string } }
  | { type: TemplateHeaderType.DOCUMENT; document: { link: string; filename?: string } }
  | { type: TemplateHeaderType.VIDEO; video: { link: string } }
  | { type: TemplateHeaderType.AUDIO; audio: { link: string } }
  | { type: TemplateHeaderType.LOCATION; location: { latitude: number; longitude: number } }
  | { type: TemplateHeaderType.STICKER; sticker: { link: string } };

export type TemplateBodyComponentCreate = {
  type: TemplateComponentType.BODY;
  text?: string;
  add_security_recommendation?: boolean;
  example?: {
    body_text?: string[][];
  };
}

export type TemplateBodyComponentSend = {
  type: TemplateComponentType.BODY;
  parameters: TemplateBodyParameter[];
}

export type TemplateBodyParameter = {
  type: TemplateBodyType.TEXT;
  text: string;
};

export type TemplateFooterComponentCreate = {
  type: TemplateComponentType.FOOTER;
  text: string;
}

export type TemplateFooterComponentSend = {
  type: TemplateComponentType.FOOTER;
  parameters: TemplateFooterParameter[];
}

export type TemplateFooterParameter = {
  type: TemplateFooterType.TEXT;
  text: string;
};

export type TemplateButtonsComponentCreate = {
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
      type: TemplateButtonType.COPY_CODE;
      text: string;
      example?: [ string ];
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
      text?: string;
      otp_type?: "COPY_CODE" | "ONE_TAP";
      autofill_text?: "Autofill";
      package_name?: string;
      signature_hash?: string;
  }
  | {
      type: TemplateButtonType.CATALOG;
      text: string;
  }
  | {
      type: TemplateButtonType.MPM;
      text: string;
  };

  export type TemplateButtonsComponentSend = {
    type: TemplateComponentType.BUTTON;
    sub_type: TemplateButtonType;
    index: string; // WhatsApp uses string index ("0", "1", ...)
    parameters: TemplateButtonsParameter[];
  }

  export type TemplateButtonsParameter = {
    type: TemplateButtonsParametersType.TEXT;
    text: string;
  };
