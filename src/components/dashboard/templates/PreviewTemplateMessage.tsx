// components/chat/TemplateMessage.tsx
"use client";

import { Template } from "@/types/Template";
import { TemplateCategory, TemplateComponentType } from "@/utiles/enums/template";
import { Message } from "@/types/Message";
import { formatRichText } from "../../common/FormatRichText";
import { TemplateMediaPreview } from "./GetTemplateMediaPreview";

interface PreviewTemplateMessageProps {
  message?: Message;
  template: Template;
}

export default function PreviewTemplateMessage({ message, template }: PreviewTemplateMessageProps) {
  if (!template || !template.components) return null;

  // Special handling for AUTHENTICATION templates
  if (template.category === TemplateCategory.AUTHENTICATION) {
    return ( 
      <div className="flex flex-col gap-1 mb-1 w-[200px]">
        <p className="text-[14px] whitespace-pre-line">
          123456 is your verification code.
        </p>

        {/* ---------------- BUTTON ---------------- */}
        <div className="flex flex-col -mb-2 -mx-3">
          <div className="flex flex-col w-full">
            <div className="flex items-center justify-center py-2 border-t gap-2 cursor-default">
              {/* ICON */}
              <img
                src={`/assets/icons/${getButtonIcon("OTP")}`}
                className="w-4 h-4"
              />

              {/* TEXT */}
              <span className="text-blue-500 dark:text-[#21C063] text-sm">
                COPY
              </span>
            </div>
          </div>

        </div>
        {/* ---------------- END BUTTON ---------------- */}
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-1 mb-1 w-[200px]">

      {/* ---------------- HEADER ---------------- */}

        {/* STATIC HEADER + MEDIA */}
        {template.components
        .filter((c) => c.type === TemplateComponentType.HEADER)
        .map((h, idx) => {
          const finalText = replaceHeaderVariables(h.text ?? "", h.example);
          return (
            <div key={idx}>
            {h.format === "TEXT" ? (
                <div className="text-sm font-semibold opacity-90">
                {finalText}
                </div>
            ) : (
                TemplateMediaPreview(h)
            )}
            </div>
        )})}

      {/* ---------------- END HEADER ---------------- */}



      {/* ---------------- BODY ---------------- */}
      {template.components
        .filter((c) => c.type === TemplateComponentType.BODY)
        .map((b, idx) => {
          const finalText = replaceBodyVariables(b.text ?? "", b.example);
          return (
            <p
              key={idx}
              className="text-[14px] whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: formatRichText(finalText) }}
            />
          );
        })}
      {/* ---------------- END BODY ---------------- */}



      {/* ---------------- FOOTER + META ---------------- */}
      <div className="flex items-center justify-between w-full mt-1">

        {/* FOOTER */}
        {template.components
          .filter((c) => c.type === TemplateComponentType.FOOTER)
          .map((f, idx) => (
            <p key={idx} className="text-xs opacity-70 text-gray-500 dark:text-gray-300">
              {f.text}
            </p>
          ))}

        {/* META INFO (Static in preview mode) */}
        {/* <MessageMetaInfo message={message!} /> */}
      </div>
      {/* ---------------- END FOOTER ---------------- */}



      {/* ---------------- BUTTONS ---------------- */}
      <div className="flex flex-col -mb-2 -mx-3">
        {template.components
          .filter((c) => c.type === TemplateComponentType.BUTTONS)
          .map((btnGroup, idx) => (
            <div key={idx} className="flex flex-col w-full">

              {btnGroup.buttons.map((btn, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center py-2 border-t gap-2 cursor-default"
                >
                  {/* ICON */}
                  <img
                    src={`/assets/icons/${getButtonIcon(btn.type)}`}
                    className="w-4 h-4"
                    style={{filter: "var(--icon-filter)"}}
                  />

                  {/* TEXT */}
                  <span className="text-blue-500 dark:text-[#21C063] text-sm">
                    {btn.text}
                  </span>
                </div>
              ))}

            </div>
          ))}
      </div>
      {/* ---------------- END BUTTONS ---------------- */}

    </div>
  );
}

/* -----------------------------------
  Replace Template Variables
------------------------------------*/
function replaceHeaderVariables(text: string, example?: any) {
  if (!text) return text;

  const vars = example?.header_text?.[0];
  if (!vars || !Array.isArray(vars)) return text;

  let updated = text;
  vars.forEach((value: string, idx: number) => {
    updated = updated.replace(
      new RegExp(`\\{\\{${idx + 1}\\}\\}`, "g"),
      value
    );
  });

  return updated;
}

function replaceBodyVariables(text: string, example?: any) {
  if (!text) return text;

  const vars = example?.body_text?.[0];
  if (!vars || !Array.isArray(vars)) return text;

  let updated = text;
  vars.forEach((value: string, idx: number) => {
    updated = updated.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, "g"), value);
  });

  return updated;
}

/* -----------------------------------
  Button icon helper
------------------------------------*/
function getButtonIcon(type: string) {
  switch (type) {
    case "URL": return "launch.svg";
    case "PHONE_NUMBER": return "call.svg";
    case "QUICK_REPLY": return "reply.svg";
    case "OTP": return "copy.svg";
    case "COPY_CODE": return "copy.svg";
    default: return "btn.svg";
  }
}
