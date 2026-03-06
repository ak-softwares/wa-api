"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TemplateBodyComponentCreate,
  TemplateButton,
  TemplateButtonsComponentCreate,
  TemplateComponentCreate,
  TemplateFooterComponentCreate,
  TemplateHeaderComponentCreate,
} from "@/types/Template";
import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderType,
} from "@/utiles/enums/template";
import { UploadedTemplateMedia } from "./useTemplateMediaUpload";

const EMPTY_MEDIA: UploadedTemplateMedia = {
  file: null,
  fileName: "",
  previewUrl: null,
  headerHandle: null,
};

export function useTemplateEditor() {
  const [templateId, setTemplateId] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>(TemplateCategory.UTILITY);
  const [templateLanguage, setTemplateLanguage] = useState("en");
  const [headerFormat, setHeaderFormat] = useState<TemplateHeaderType>(TemplateHeaderType.TEXT);
  const [headerText, setHeaderText] = useState("");
  const [headerSampleValues, setHeaderSampleValues] = useState("");
  const [headerMedia, setHeaderMedia] = useState<UploadedTemplateMedia>(EMPTY_MEDIA);
  const [bodyText, setBodyText] = useState("Hello");
  const [bodySampleValues, setBodySampleValues] = useState([""]);
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<TemplateButton[]>([{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
  const [isVariableAddedInButtonUrl, setIsVariableAddedInButtonUrl] = useState(false);
  const [urlSampleValues, setUrlSampleValues] = useState("");
  const [copyCodeSampleValues, setCopyCodeSampleValues] = useState("");

  const extractVariables = (text: string) => {
    const regex = /{{(\d+)}}/g;
    return [...text.matchAll(regex)].map((match) => Number.parseInt(match[1], 10)).sort((a, b) => a - b);
  };

  const headerVariables = useMemo(() => extractVariables(headerText), [headerText]);
  const bodyVariables = useMemo(() => extractVariables(bodyText), [bodyText]);

  const toMetaTemplateName = (input: string): string =>
    input.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").replace(/_+/g, "_");

  const updateSampleValues = (newVariables: number[]) => {
    const next = [...bodySampleValues];
    if (next.length > newVariables.length) next.splice(newVariables.length);
    while (next.length < newVariables.length) next.push(`Sample ${next.length + 1}`);
    setBodySampleValues(next);
  };

  const handleBodyTextChange = (value: string) => {
    setBodyText(value);
    updateSampleValues(extractVariables(value));
  };

  const addVariableInBody = () => {
    const next = bodyVariables.length ? Math.max(...bodyVariables) + 1 : 1;
    const nextText = `${bodyText} {{${next}}}`;
    setBodyText(nextText);
    updateSampleValues([...bodyVariables, next]);
  };

  const addVariableInHeader = () => {
    const next = headerVariables.length ? Math.max(...headerVariables) + 1 : 1;
    setHeaderText(`${headerText} {{${next}}}`);
  };

  const addButton = () => {
    if (buttons.length < 3) setButtons((prev) => [...prev, { type: TemplateButtonType.QUICK_REPLY, text: "" }]);
  };

  const removeButton = (index: number) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: string, value: string) => {
    setButtons((prev) => {
      const next = [...prev];
      if (field === "URL") return prev;

      if (field === "type") {
        next[index] = {
          type: value as TemplateButtonType,
          text: next[index].type === TemplateButtonType.COPY_CODE ? "Copy offer code" : next[index].text,
          ...(value === TemplateButtonType.URL ? { url: "" } : {}),
          ...(value === TemplateButtonType.PHONE_NUMBER ? { phone_number: "" } : {}),
        } as TemplateButton;
      } else {
        next[index] = { ...next[index], [field]: value } as TemplateButton;
      }

      if (next[index].type === TemplateButtonType.URL && isVariableAddedInButtonUrl && urlSampleValues) {
        next[index] = { ...next[index], example: [urlSampleValues] } as TemplateButton;
      } else if (next[index].type === TemplateButtonType.URL) {
        delete (next[index] as any).example;
      }

      if (next[index].type === TemplateButtonType.COPY_CODE && copyCodeSampleValues) {
        next[index] = { ...next[index], text: "Copy offer code", example: [copyCodeSampleValues] } as TemplateButton;
      }

      return next;
    });
  };

  const addVariableInUrlButton = (index: number) => {
    setIsVariableAddedInButtonUrl(true);
    const button = buttons[index];
    if (button.type !== TemplateButtonType.URL || (button as any).url?.includes("{{1}}")) return;
    updateButton(index, "url", `${(button as any).url || ""}{{1}}`);
  };

  const removeVariableInUrlButton = (index: number) => {
    const button = buttons[index];
    if (button.type !== TemplateButtonType.URL) return;
    updateButton(index, "url", ((button as any).url || "").replace(/\{\{1\}\}/g, ""));
    setIsVariableAddedInButtonUrl(false);
    setUrlSampleValues("");
  };

  const getAcceptedFileTypes = () => {
    switch (headerFormat) {
      case TemplateHeaderType.IMAGE:
        return "image/*";
      case TemplateHeaderType.VIDEO:
        return "video/*";
      case TemplateHeaderType.DOCUMENT:
        return ".pdf,.doc,.docx,.xls,.xlsx";
      default:
        return "*";
    }
  };

  const resetForm = () => {
    if (headerMedia.previewUrl) URL.revokeObjectURL(headerMedia.previewUrl);
    setTemplateId("");
    setTemplateName("");
    setTemplateCategory(TemplateCategory.UTILITY);
    setTemplateLanguage("en");
    setHeaderFormat(TemplateHeaderType.TEXT);
    setHeaderText("");
    setHeaderSampleValues("");
    setHeaderMedia(EMPTY_MEDIA);
    setBodyText("Hello");
    setBodySampleValues([""]);
    setFooterText("");
    setButtons([{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
    setIsVariableAddedInButtonUrl(false);
    setUrlSampleValues("");
    setCopyCodeSampleValues("");
  };

  const setMedia = (data: UploadedTemplateMedia) => {
    if (headerMedia.previewUrl) URL.revokeObjectURL(headerMedia.previewUrl);
    setHeaderMedia(data);
  };

  const clearMedia = () => {
    if (headerMedia.previewUrl) URL.revokeObjectURL(headerMedia.previewUrl);
    setHeaderMedia(EMPTY_MEDIA);
  };

  const hydrateFromTemplate = (template: any, { includeId = false, copyName = false } = {}) => {
    setTemplateId(includeId ? template.id || "" : "");
    setTemplateName(copyName ? `${template.name}_copy` : template.name);
    setTemplateCategory(template.category as TemplateCategory);
    setTemplateLanguage(template.language || "en");

    const headerComp = template?.components?.find((c: any) => c.type === TemplateComponentType.HEADER) as TemplateHeaderComponentCreate | undefined;
    const bodyComp = template?.components?.find((c: any) => c.type === TemplateComponentType.BODY) as TemplateBodyComponentCreate | undefined;
    const footerComp = template?.components?.find((c: any) => c.type === TemplateComponentType.FOOTER) as TemplateFooterComponentCreate | undefined;
    const buttonsComp = template?.components?.find((c: any) => c.type === TemplateComponentType.BUTTONS) as TemplateButtonsComponentCreate | undefined;

    setHeaderFormat(headerComp?.format || TemplateHeaderType.TEXT);
    setHeaderText(headerComp?.text || "");
    setBodyText(bodyComp?.text || "");
    setFooterText(footerComp?.text || "");
    setButtons(buttonsComp?.buttons?.map((btn) => ({ ...btn })) || [{ type: TemplateButtonType.QUICK_REPLY, text: "" }]);
    clearMedia();
  };

  const buildComponents = () => {
    const components: TemplateComponentCreate[] = [];

    if (templateCategory === TemplateCategory.AUTHENTICATION) {
      components.push(
        {
          type: TemplateComponentType.BODY,
          example: { body_text: [["123456"]] },
        },
        {
          type: TemplateComponentType.BUTTONS,
          buttons: [{ type: TemplateButtonType.OTP, otp_type: TemplateButtonType.COPY_CODE }],
        }
      );

      return components;
    }

    if (headerFormat === TemplateHeaderType.TEXT && headerText.trim()) {
      const headerComponent: TemplateHeaderComponentCreate = {
        type: TemplateComponentType.HEADER,
        format: headerFormat,
        text: headerText,
      };

      if (/\{\{\d+\}\}/.test(headerText)) {
        headerComponent.example = { header_text: [headerSampleValues] };
      }

      components.push(headerComponent);
    }

    if ([TemplateHeaderType.IMAGE, TemplateHeaderType.VIDEO, TemplateHeaderType.DOCUMENT].includes(headerFormat) && headerMedia.headerHandle) {
      components.push({
        type: TemplateComponentType.HEADER,
        format: headerFormat,
        example: { header_handle: [headerMedia.headerHandle] },
      });
    }

    if (headerFormat === TemplateHeaderType.LOCATION) {
      components.push({
        type: TemplateComponentType.HEADER,
        format: TemplateHeaderType.LOCATION,
      });
    }
    
    if (bodyText.trim()) {
      const bodyComponent: TemplateBodyComponentCreate = {
        type: TemplateComponentType.BODY,
        text: bodyText,
      };

      if (/\{\{\d+\}\}/.test(bodyText)) {
        bodyComponent.example = { body_text: [bodySampleValues] };
      }

      components.push(bodyComponent);
    }

    if (footerText.trim()) {
      components.push({ type: TemplateComponentType.FOOTER, text: footerText });
    }

    const validButtons = buttons.filter((btn) => btn?.text?.trim());
    if (validButtons.length) {
      components.push({ type: TemplateComponentType.BUTTONS, buttons: validButtons });
    }

    return components;
  };

  useEffect(() => {
    if (!isVariableAddedInButtonUrl || !urlSampleValues) return;
    setButtons((prev) => prev.map((btn) => (btn.type === TemplateButtonType.URL ? { ...btn, example: [urlSampleValues] } : btn)));
  }, [isVariableAddedInButtonUrl, urlSampleValues]);

  useEffect(() => {
    if (!copyCodeSampleValues) return;
    setButtons((prev) =>
      prev.map((btn) => (btn.type === TemplateButtonType.COPY_CODE ? { ...btn, text: "Copy offer code", example: [copyCodeSampleValues] } : btn))
    );
  }, [copyCodeSampleValues]);

  return {
    templateId,
    templateName,
    setTemplateName,
    toMetaTemplateName,
    templateCategory,
    setTemplateCategory,
    templateLanguage,
    setTemplateLanguage,
    headerFormat,
    setHeaderFormat,
    headerText,
    setHeaderText,
    headerSampleValues,
    setHeaderSampleValues,
    headerMedia,
    setMedia,
    clearMedia,
    bodyText,
    bodyVariables,
    bodySampleValues,
    setBodySampleValues,
    handleBodyTextChange,
    addVariableInBody,
    addVariableInHeader,
    footerText,
    setFooterText,
    buttons,
    addButton,
    removeButton,
    updateButton,
    addVariableInUrlButton,
    removeVariableInUrlButton,
    isVariableAddedInButtonUrl,
    urlSampleValues,
    setUrlSampleValues,
    copyCodeSampleValues,
    setCopyCodeSampleValues,
    getAcceptedFileTypes,
    buildComponents,
    resetForm,
    hydrateFromTemplate,
  };
}
