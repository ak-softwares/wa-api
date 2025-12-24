import { Template } from "@/types/Template";
import { TemplateComponentType, TemplateHeaderType } from "@/utiles/enums/template";


/**
 * Convert internal Template -> WhatsApp Send Template JSON
 */
export function buildMetaTemplatePayload( template: Template ) {
  if (!template) return null;

  const components: any[] = [];

  template.components?.forEach((comp: any) => {
    const type = String(comp.type).toUpperCase();

    /* ------------------------ HEADER ------------------------ */
    if (type === TemplateComponentType.HEADER) {
      const header: any = {
        type: "header",
        parameters: []
      };

      const format = String(comp.format).toUpperCase();

      switch (format) {
        case TemplateHeaderType.TEXT:
          if (comp.text) {
            header.parameters.push({
              type: "text",
              text: comp.text
            });
          }
          break;

        case TemplateHeaderType.IMAGE:
          header.parameters.push({
            type: "image",
            image: { id: comp.example?.header_handle ?? "" }
          });
          break;

        case TemplateHeaderType.DOCUMENT:
          header.parameters.push({
            type: "document",
            document: { id: comp.example?.header_handle ?? "" }
          });
          break;

        case TemplateHeaderType.VIDEO:
          header.parameters.push({
            type: "video",
            video: { id: comp.example?.header_handle ?? "" }
          });
          break;
      }

      components.push(header);
    }

    /* ------------------------ BODY ------------------------ */
    if (type === TemplateComponentType.BODY) {
      const bodyParams: any[] = [];

      // Example: [["Akash", "12345", "Product", "99"]]
      if (Array.isArray(comp.example?.body_text?.[0])) {
        comp.example.body_text[0].forEach((text: string) => {
          bodyParams.push({
            type: "text",
            text
          });
        });
      }

      if (bodyParams.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParams
        });
      }
    }


    /* ------------------------ FOOTER ------------------------ */
    // if (type === TemplateComponentType.FOOTER) {
    //   if (comp.text) {
    //     components.push({
    //       type: "footer",
    //       parameters: [
    //         {
    //           type: "text",
    //           text: comp.text
    //         }
    //       ]
    //     });
    //   }
    // }

    /* ------------------------ BUTTONS ------------------------ */
    // if (type === TemplateComponentType.BUTTONS) {
    //   comp.buttons?.forEach((btn: any, index: number) => {
    //     const btnComp: any = {
    //       type: "button",
    //       sub_type: btn.type,
    //       index: String(index),
    //       parameters: []
    //     };

    //     // For URL or Phone CTA button parameters
    //     if (btn.example?.length) {
    //       btnComp.parameters.push({
    //         type: "text",
    //         text: btn.example[0]
    //       });
    //     }

    //     components.push(btnComp);
    //   });
    // }
  });

  /* ------------------------ FINAL SEND PAYLOAD ------------------------ */
    const metaPayload: any = {
    template: {
        name: template.name,
        language: { code: template.language || "en" }
    }
    };

    // ❌ Do NOT add components if empty
    if (components.length > 0) {
        metaPayload.template.components = components;
    }


  return metaPayload;
}
