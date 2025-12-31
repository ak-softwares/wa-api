import {
  Template,
  TemplateComponentSend,
  TemplatePayload,
} from "@/types/Template";
import {
  TemplateBodyType,
  TemplateComponentType,
  TemplateHeaderType,
  TemplateButtonType,
  TemplateButtonsParametersType,
} from "@/utiles/enums/template";

export function convertToMetaSendTemplate({ template }: { template: Template; }) {
  const components: TemplateComponentSend[] = [];

  for (const comp of template.components || []) {
    // ===== HEADER =====
    if (comp.type === TemplateComponentType.HEADER) {
      // IMAGE HEADER
      if (comp.format === TemplateHeaderType.IMAGE) {
        const handle = comp.example?.header_handle;
        if (!handle) continue;

        const value = Array.isArray(handle) ? handle[0] : handle;

        components.push({
          type: TemplateComponentType.HEADER,
          parameters: [
            value.startsWith("http")
              ? {
                  type: TemplateHeaderType.IMAGE,
                  image: { link: value },
                }
              : {
                  type: TemplateHeaderType.IMAGE,
                  image: { id: value },
                },
          ],
        });
      }

      // TEXT HEADER ({{1}})
      if (comp.format === TemplateHeaderType.TEXT) {
        const headerValue = comp.example?.header_text?.[0]?.[0];

        if (headerValue) {
          components.push({
            type: TemplateComponentType.HEADER,
            parameters: [
              {
                type: TemplateHeaderType.TEXT,
                text: headerValue,
              },
            ],
          });
        }
      }
    }

    // ===== BODY =====
    if (comp.type === TemplateComponentType.BODY) {
      const bodyValues = comp.example?.body_text?.[0] || [];

      components.push({
        type: TemplateComponentType.BODY,
        parameters: bodyValues.map((text: string) => ({
          type: TemplateBodyType.TEXT,
          text,
        })),
      });
    }

    // ===== BUTTONS =====
    if (comp.type === TemplateComponentType.BUTTONS) {
      (comp.buttons || []).forEach((button, index) => {
        // COPY_CODE
        if (button.type === TemplateButtonType.COPY_CODE) {
          const code = button.example?.[0];
          if (!code) return;

          components.push({
            type: TemplateComponentType.BUTTON, // ✅ singular
            sub_type: TemplateButtonType.COPY_CODE,
            index: String(index), // ✅ array index → string
            parameters: [
              {
                type: TemplateButtonsParametersType.TEXT,
                text: code,
              },
            ],
          });
        }

        // URL
        if (button.type === TemplateButtonType.URL) {
          const url = button.example?.[0];
          if (!url) return;

          components.push({
            type: TemplateComponentType.BUTTON, // ✅ singular
            sub_type: TemplateButtonType.URL,
            index: String(index), // ✅ array index → string
            parameters: [
              {
                type: TemplateButtonsParametersType.TEXT,
                text: url,
              },
            ],
          });
        }
      });
    }
  }
  const templatePayload: TemplatePayload = {
    name: template.name,
    language: {
      code: template.language,
    },
    components,
  };

  return templatePayload;
}
