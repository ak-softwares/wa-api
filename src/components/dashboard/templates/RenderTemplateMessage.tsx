// components/chat/TemplateMessage.tsx
"use client";

import { Template } from "@/types/Template";
import { TemplateComponentType } from "@/utiles/enums/template";
import React, { useEffect, useState } from "react";
import { formatRichText } from "../../common/FormatRichText";
import MessageMetaInfo from "../messages/MessageMetaInfo";
import { Message } from "@/types/Message";
import { fetchMediaBlob } from "@/services/message/media.service";
import { toast } from "@/components/ui/sonner";

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

          const mediaId = h.example?.header_handle;

          // Local states for preview URLs
          const [mediaUrl, setMediaUrl] = useState<string | null>(null);

          useEffect(() => {
            if (!mediaId) return;
            if (isUrl(mediaId)) {
              setMediaUrl(mediaId);
              return;
            }
            const load = async () => {
              const url = await fetchMediaBlob(mediaId);
              setMediaUrl(url);
            };
            load();
          }, [mediaId]);

          // TEXT HEADER
          if (h.format === "TEXT") {
            return (
              <div key={idx} className="text-sm font-semibold opacity-90">
                {h.text}
              </div>
            );
          }

          // IMAGE HEADER
          if (h.format === "IMAGE") {
            return (
              <div key={idx} className="-ml-2 -mr-2 -mt-1">
                <img
                  src={mediaUrl || "/placeholder.png"}
                  alt="header-image"
                  className="rounded-md w-full max-h-48 object-cover"
                />
              </div>
            );
          }

          // VIDEO HEADER
          if (h.format === "VIDEO") {
            return (
              <div key={idx} className="-ml-2 -mr-2 -mt-1">
                <video controls className="rounded-md w-full max-h-48">
                  <source src={mediaUrl || ""} />
                </video>
              </div>
            );
          }

          // DOCUMENT HEADER
          if (h.format === "DOCUMENT") {
            return (
              <a
                key={idx}
                href={mediaUrl || "#"}
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
      <div className="flex flex-col -mb-2 -mx-3">
        {template.components
          .filter((c: any) => c.type === TemplateComponentType.BUTTONS)
          .map((btnGroup: any, idx: number) => (
            <div key={idx} className="flex flex-col w-full">
              {btnGroup.buttons.map((btn: any, bIndex: number) => {
                // ---------------- URL BUTTON ----------------
                if (btn.type === "URL" && template.category !== "AUTHENTICATION") {
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

                if (template.category === "AUTHENTICATION" || btn.type === "OTP") {
                  const otpCode = btn.text;
                  const handleCopy = async () => {
                    await navigator.clipboard.writeText(otpCode);
                    toast.success(`OTP copied to clipboard ${otpCode}`);
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




