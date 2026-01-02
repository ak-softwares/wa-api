import { ITemplate } from "@/models/Template";
import { TemplateBodyParameter, TemplateComponentCreate, TemplateComponentSend, TemplatePayload } from "@/types/Template";
import {
  TemplateComponentType,
  TemplateHeaderType,
  TemplateButtonType,
  TemplateButtonsParametersType,
} from "@/utiles/enums/template";

interface ReplaceActualTemplateParamsParams {
  metaTemplate: ITemplate;
  messagePayload: TemplatePayload;
}

export function replaceActualTemplateValue({
  metaTemplate,
  messagePayload,
}: ReplaceActualTemplateParamsParams): ITemplate {
  const updatedTemplate: ITemplate = {
    ...metaTemplate,
    components: metaTemplate.components?.map((metaComp) => {
      // ================= HEADER =================
      if (metaComp.type === TemplateComponentType.HEADER) {
        const payloadHeader = messagePayload.components?.find(
          (c: TemplateComponentSend) => c.type === TemplateComponentType.HEADER
        );

        if (!payloadHeader?.parameters?.[0]) return metaComp;

        const param = payloadHeader.parameters[0];

        // IMAGE HEADER
        if (param.type === TemplateHeaderType.IMAGE) {
          const handle = param.image?.link || param.image?.id;
          
          if (!handle) return metaComp;

          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              header_handle: [handle],
            },
          };
        }

        // VIDEO HEADER
        if (param.type === TemplateHeaderType.VIDEO) {
          const handle = param.video?.link || param.video?.id;
          
          if (!handle) return metaComp;

          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              header_handle: [handle],
            },
          };
        }

        // DOCUMENT HEADER
        if (param.type === TemplateHeaderType.DOCUMENT) {
          const handle = param.document?.link || param.document?.id;
          
          if (!handle) return metaComp;

          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              header_handle: [handle],
            },
          };
        }

        // TEXT HEADER
        if (param.type === TemplateHeaderType.TEXT) {
          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              header_text: [[param.text]], // 2D array as expected by Meta
            },
          };
        }

        // LOCATION HEADER
        if (param.type === TemplateHeaderType.LOCATION) {
          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              location: {
                latitude: param.location?.latitude,
                longitude: param.location?.longitude,
                name: param.location?.name || "",
                address: param.location?.address || "",
              },
            },
          };
        }

        return metaComp;
      }

      // ================= BODY =================
      if (metaComp.type === TemplateComponentType.BODY) {
        const payloadBody = messagePayload.components?.find(
          (c: TemplateComponentSend) => c.type === TemplateComponentType.BODY
        );

        if (!payloadBody?.parameters?.length) return metaComp;

        const bodyValues = payloadBody.parameters.map(
          (p: TemplateBodyParameter) => p.text || ""
        );

        return {
          ...metaComp,
          example: {
            ...metaComp.example,
            body_text: [bodyValues], // Meta expects 2D array
          },
        };
      }

      // ================= BUTTONS =================
      if (metaComp.type === TemplateComponentType.BUTTONS) {
        const payloadButtons = messagePayload.components?.filter(
          (c: TemplateComponentSend) => c.type === TemplateComponentType.BUTTON
        );

        if (!payloadButtons?.length) return metaComp;

        const updatedButtons = metaComp.buttons?.map((btn: any, index: number) => {
          const payloadBtn = payloadButtons.find(
            (p: any) => p.index === String(index) || Number(p.index) === index
          );

          if (!payloadBtn?.parameters?.[0]) return btn;

          const param = payloadBtn.parameters[0];

          // COPY_CODE BUTTON
          if (
            btn.type === TemplateButtonType.COPY_CODE &&
            payloadBtn.sub_type === TemplateButtonType.COPY_CODE
          ) {
            if (param.type === TemplateButtonsParametersType.COUPON_CODE) {
              return {
                ...btn,
                example: [param.coupon_code],
              };
            }
          }

          // URL BUTTON
          if (
            btn.type === TemplateButtonType.URL &&
            payloadBtn.sub_type === TemplateButtonType.URL
          ) {
            if (param.type === TemplateButtonsParametersType.TEXT) {
              return {
                ...btn,
                example: [param.text],
              };
            }
          }

          return btn;
        });

        return {
          ...metaComp,
          buttons: updatedButtons,
        };
      }

      // ================= UNCHANGED COMPONENTS =================
      return metaComp;
    }) as TemplateComponentCreate[] | undefined,
  };

  return updatedTemplate;
}