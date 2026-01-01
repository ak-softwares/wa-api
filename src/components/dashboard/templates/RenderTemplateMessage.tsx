// components/chat/TemplateMessage.tsx
"use client";

import { Template } from "@/types/Template";
import { TemplateButtonType, TemplateCategory, TemplateComponentType } from "@/utiles/enums/template";
import React from "react";
import { formatRichText } from "../../common/FormatRichText";
import MessageMetaInfo from "../messages/MessageMetaInfo";
import { Message } from "@/types/Message";
import { toast } from "@/components/ui/sonner";
import TemplateMediaPreview from "./TemplateMediaPreview";

interface TemplateMessageProps {
  message?: Message;
  template: Template; // You can replace this with Template type if needed
}

export default function TemplateMessage({ message, template }: TemplateMessageProps) {
  if (!template || !template.components) return null;

  const isUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-1 min-w-[200px]">

      {template.components
        .filter((c: any) => c.type === TemplateComponentType.HEADER)
        .map((h: any, idx: number) => {
          // TEXT HEADER
          if (h.format === "TEXT") {
            const finalText = replaceHeaderVariables(h.text ?? "", h.example);
            return (
              <div key={idx} className="text-sm font-semibold opacity-90">
                {finalText}
              </div>
            );
          }

          // MEDIA HEADER (IMAGE | VIDEO | DOCUMENT)
          return (
            <div key={idx}>
              <TemplateMediaPreview h={h} />
            </div>
          );
        })}

      {/* ---------------- BODY ---------------- */}
      {template.components
        .filter((c: any) => c.type === TemplateComponentType.BODY)
        .map((b: any, idx: number) => {
          const finalText = replaceBodyVariables(b.text, b.example);

          return (
            <p key={idx} className="text-[14px] whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatRichText(finalText) }}>
            </p>
          );
        })
      }


      {/* ---------------- FOOTER + META ---------------- */}
      <div className="flex items-center justify-between w-full mt-1">
        {/* Footer text (left) */}
        {template.components
          .filter((c: any) => c.type === TemplateComponentType.FOOTER)
          .map((f: any, idx: number) => (
            <p
              key={idx}
              className="text-xs opacity-70 text-gray-500 dark:text-gray-300"
            >
              {f.text}
            </p>
          ))}

        {/* Meta info (right) */}
        <MessageMetaInfo message={message!} />
      </div>


      {/* ---------------- BUTTONS ---------------- */}
      <div className="flex flex-col -mb-2 -mx-3">
        {template.components
          .filter((c: any) => c.type === TemplateComponentType.BUTTONS)
          .map((btnGroup: any, idx: number) => (
            <div key={idx} className="flex flex-col w-full">
              {btnGroup.buttons.map((btn: any, bIndex: number) => {
                // ---------------- URL BUTTON ----------------
                if (btn.type === TemplateButtonType.URL && template.category !== TemplateCategory.AUTHENTICATION) {
                  return (
                    <div
                      key={bIndex}
                      className="flex items-center justify-center py-2 cursor-pointer border-t gap-2"
                    >
                      <img
                        src="/assets/icons/launch.svg"
                        alt="url-icon"
                        className="w-4 h-4 object-contain"
                        style={{
                          filter: "var(--icon-filter)",
                        }}
                      />

                      <a
                        href={btn.url}
                        target="_blank"
                        className="text-blue-500 dark:text-[#21C063] text-sm leading-none text-center"
                      >
                        {btn.text}
                      </a>
                    </div>
                  );
                }
                if (btn.type === TemplateButtonType.PHONE_NUMBER) {
                  return (
                    <div
                      key={bIndex}
                      className="flex items-center justify-center py-2 cursor-pointer border-t gap-2"
                    >
                      <img
                        src="/assets/icons/call.svg" // add your phone icon
                        alt="phone-icon"
                        className="w-4 h-4 object-contain"
                        style={{
                          filter: "var(--icon-filter)",
                        }}
                      />
                      <a
                        href={`tel:${btn.phone_number}`}
                        className="text-blue-500 dark:text-[#21C063] text-sm leading-none"
                      >
                        {btn.text}
                      </a>
                    </div>
                  );
                }

                if (btn.type === TemplateButtonType.QUICK_REPLY) {
                  return (
                    <div
                      key={bIndex}
                      className="flex items-center justify-center py-2 cursor-pointer border-t gap-2"
                    >
                      <img
                        src="/assets/icons/reply.svg"
                        alt="reply-icon"
                        style={{
                          filter: "var(--icon-filter)",
                        }}
                        className="w-4 h-4 object-contain"
                      />

                      <a
                        href={`tel:${btn.phone_number}`}
                        className="text-blue-500 dark:text-[#21C063] text-sm leading-none"
                      >
                        {btn.text}
                      </a>
                    </div>
                  );
                }

                if (template.category === TemplateCategory.AUTHENTICATION || btn.type === TemplateButtonType.COPY_CODE) {
                  const otpCode = btn.example?.[0];
                  const handleCopy = async () => {
                    await navigator.clipboard.writeText(otpCode);
                    toast.success(`Copied to clipboard ${otpCode}`);
                  };
                  return (
                      <div
                        key={bIndex}
                        onClick={handleCopy}
                        className="flex items-center justify-center py-2 cursor-pointer border-t gap-2"
                      >
                        <img
                          src="/assets/icons/copy.svg"
                          alt="copy-icon"
                          style={{
                            filter: "var(--icon-filter)",
                          }}
                          className="w-4 h-4 object-contain"
                        />

                        <span
                          className="text-blue-500 dark:text-[#21C063] text-sm leading-none"
                        >
                          {btn.text}
                        </span>
                      </div>
                  );
                }

                return null;
              })}
            </div>
          ))}
      </div>
    </div>
  );
}

/* -----------------------------------
  Replace Template Variables
------------------------------------*/
function replaceHeaderVariables(
  text: string,
  example?: { header_text?: string[] }
) {
  if (!text) return text;

  const value = example?.header_text?.[0];
  if (!value) return text;

  // Header supports only {{1}}
  return text.replace(new RegExp(`\\{\\{${1}\\}\\}`, "g"), value);
}

function replaceBodyVariables(text: string, example?: any) {
  if (!text) return text;

  const vars = example?.body_text?.[0];
  if (!vars || !Array.isArray(vars)) return text;

  let updated = text;

  vars.forEach((value: string, idx: number) => {
    const pattern = new RegExp(`\\{\\s*\\{${idx + 1}\\}\\s*\\}`, "g");
    updated = updated.replace(pattern, value);
  });

  return updated;
}




