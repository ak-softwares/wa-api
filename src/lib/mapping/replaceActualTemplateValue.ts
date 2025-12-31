import { ITemplate } from "@/models/Template";
import { TemplateComponentType } from "@/utiles/enums/template";

interface ReplaceActualTemplateParamsParams {
  metaTemplate: ITemplate;
  messagePayload: any;
}

export function replaceActualTemplateValue({
  metaTemplate,
  messagePayload,
}: ReplaceActualTemplateParamsParams): ITemplate {
  const updatedTemplate: ITemplate = {
    ...metaTemplate,
    components: metaTemplate.components?.map((metaComp) => {
      // HEADER
      if (metaComp.type === TemplateComponentType.HEADER) {
        const payloadHeader = messagePayload.components?.find(
          (c: any) => c.type.toLowerCase() === "header"
        );

        if (
          payloadHeader &&
          payloadHeader.parameters?.[0]?.type === "image"
        ) {
          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              header_handle: [
                payloadHeader.parameters[0].image.link,
              ],
            },
          };
        }

        return metaComp;
      }

      // BODY
      if (metaComp.type === TemplateComponentType.BODY) {
        const payloadBody = messagePayload.components?.find(
          (c: any) => c.type.toLowerCase() === "body"
        );

        if (payloadBody?.parameters?.length) {
          const bodyValues = payloadBody.parameters.map(
            (p: any) => p.text
          );

          return {
            ...metaComp,
            example: {
              ...metaComp.example,
              body_text: [bodyValues], // Meta expects 2D array
            },
          };
        }

        return metaComp;
      }

      // FOOTER / BUTTONS – unchanged
      return metaComp;
    }),
  };

  return updatedTemplate;
}
