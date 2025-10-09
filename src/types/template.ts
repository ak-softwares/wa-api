export interface ITemplate {
  id?: string;
  name: string;
  category: "MARKETING" | "UTILITY" | "AUTHENTICATION";
  language: string; // e.g. "en"
  components: TemplateComponent[];
  status?: string; // e.g. "APPROVED", "REJECTED", etc.
  createdAt?: string;
  [key: string]: any; // for any extra Facebook fields
}

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
    header_text?: string[];
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
