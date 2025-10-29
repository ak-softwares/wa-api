import { Types } from "mongoose";

export interface ITemplate {
  userId: Types.ObjectId;
  waAccountId: Types.ObjectId;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string; // e.g. "en"
  components: TemplateComponent[];
  status?: "APPROVED" | "REJECTED" | "PENDING" | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any; // for any extra Facebook fields
}

export type Template = ITemplate;

export type TemplateComponent =
  | TemplateHeaderComponent
  | TemplateBodyComponent
  | TemplateFooterComponent
  | TemplateButtonsComponent;

export interface TemplateHeaderComponent {
  type: "HEADER";
  format: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
  text?: string;
  example?: {
    header_handle?: string[];
  };
}

export interface TemplateBodyComponent {
  type: "BODY";
  text: string;
  example?: {
    body_text?: string[][];
  };
}

export interface TemplateFooterComponent {
  type: "FOOTER";
  text: string;
}

export interface TemplateButtonsComponent {
  type: "BUTTONS";
  buttons: TemplateButton[];
}

export type TemplateButton =
  | {
      type: "URL";
      text: string;
      url: string;
    }
  | {
      type: "QUICK_REPLY";
      text: string;
    }
  | {
      type: "PHONE_NUMBER";
      text: string;
      phone_number: string;
    };
