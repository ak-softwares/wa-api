// components/chat/TemplateMessage.tsx
"use client";

import { ITemplate } from "@/types/Template";
import { TemplateComponentType } from "@/utiles/enums/template";
import React, { useEffect, useState } from "react";
import { formatRichText } from "./FormatRichText";
import MessageMetaInfo from "../dashboard/messages/MessageMetaInfo";
import { Message } from "@/types/Message";

interface TemplateMessageProps {
  message?: Message;
  template: ITemplate; // You can replace this with Template type if needed
}

export default function TemplateMessage({ message, template }: TemplateMessageProps) {
  if (!template || !template.components) return null;

  return (
    <div className="flex flex-col gap-1 mb-1 min-w-[200px]">

      {/* ---------------- HEADER ---------------- */}
      {template.components
        .filter((c: any) => c.type === TemplateComponentType.HEADER)
        .map((h: any, idx: number) => {
          if (h.format === "TEXT") {
            return (
              <div key={idx} className="text-sm font-semibold opacity-90">
                {h.text}
              </div>
            );
          }

          if (h.format === "IMAGE") {
            const mediaId = h.example?.header_handle;
            return (
              <div key={idx} className="-ml-2 -mr-2 -mt-1">
                <img
                  src={`/api/whatsapp/media/${mediaId}`}
                  alt="header-image"
                  className="rounded-md w-full max-h-48 object-cover"
                />
              </div>
            );
          }

          if (h.format === "VIDEO") {
            const mediaId = h.example?.header_handle;
            return (
              <div key={idx} className="-ml-2 -mr-2 -mt-1">
                <video key={idx} controls className="rounded-md w-full max-h-48">
                  <source src={`/api/whatsapp/media/${mediaId}`} />
                </video>
              </div>
            );
          }

          if (h.format === "DOCUMENT") {
            return (
              <a
                key={idx}
                href={h.example?.header_handle?.[0]}
                target="_blank"
                className="text-blue-600 underline dark:text-[#21C063]"
              >
                Download Document
              </a>
            );
          }

          return null;
        })
      }

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
      <div className="flex flex-col gap-4 mt-2 -mb-2 -mx-3">
        {template.components
          .filter((c: any) => c.type === TemplateComponentType.BUTTONS)
          .map((btnGroup: any, idx: number) => (
            <div key={idx} className="flex flex-col mt-2 w-full">
              {btnGroup.buttons.map((btn: any, bIndex: number) => {
                // ---------------- URL BUTTON ----------------
                if (btn.type === "URL") {
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
                if (btn.type === "PHONE_NUMBER") {
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

                if (btn.type === "QUICK_REPLY") {
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

                if (btn.type === "OTP") {
                  return (
                    <button
                      key={bIndex}
                      className="px-3 py-2 gap-2 justify-center bg-green-500 text-white rounded-md text-sm border-t"
                    >
                      {btn.text}
                    </button>
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




