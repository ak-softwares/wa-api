import { ChatParticipant } from "@/types/Chat";
import {
  TemplatePayload,
  TemplateComponentSend,
  TemplateHeaderComponentSend,
  TemplateBodyComponentSend,
  TemplateFooterComponentSend,
  TemplateButtonsComponentSend,
} from "@/types/Template";

import {
  TemplateComponentType,
  TemplateHeaderType,
  TemplateButtonsParametersType,
} from "@/utiles/enums/template";

/* --------------------------
   Replace vars
-------------------------- */
function replaceTemplateVars(text: string, participant: ChatParticipant) {
  const vars: Record<string, string> = {
    user_name: participant.name ?? "",
    user_number: participant.number ?? "",
  };

  return text.replace(/\{\{(.*?)\}\}/g, (_, k) => vars[k] ?? "");
}

/* --------------------------
   Main
-------------------------- */
export function injectParticipantVariables({
  template,
  participant,
}: {
  template: TemplatePayload;
  participant: ChatParticipant;
}): TemplatePayload {
  return {
    ...template,
    components: template.components?.map((component): TemplateComponentSend => {
      switch (component.type) {
        /* ---------------- HEADER ---------------- */
        case TemplateComponentType.HEADER: {
          const c = component as TemplateHeaderComponentSend;

          return {
            ...c,
            parameters: c.parameters.map((p) =>
              p.type === TemplateHeaderType.TEXT
                ? { ...p, text: replaceTemplateVars(p.text, participant) }
                : p
            ),
          };
        }

        /* ---------------- BODY ---------------- */
        case TemplateComponentType.BODY: {
          const c = component as TemplateBodyComponentSend;

          return {
            ...c,
            parameters: c.parameters.map((p) => ({
              ...p,
              text: replaceTemplateVars(p.text, participant),
            })),
          };
        }

        /* ---------------- FOOTER ---------------- */
        case TemplateComponentType.FOOTER: {
          const c = component as TemplateFooterComponentSend;

          return {
            ...c,
            parameters: c.parameters.map((p) => ({
              ...p,
              text: replaceTemplateVars(p.text, participant),
            })),
          };
        }

        /* ---------------- BUTTON ---------------- */
        case TemplateComponentType.BUTTON: {
          const c = component as TemplateButtonsComponentSend;

          return {
            ...c,
            parameters: c.parameters.map((p) =>
              p.type === TemplateButtonsParametersType.TEXT
                ? { ...p, text: replaceTemplateVars(p.text, participant) }
                : p
            ),
          };
        }

        default:
          return component;
      }
    }),
  };
}
