"use client";

import { Message } from "@/types/Message";
import TemplateMessage from "../dashboard/templates/RenderTemplateMessage";
import MediaMessage from "../dashboard/templates/RenderMediaMessage";
import { formatRichText } from "./FormatRichText";
import MessageMetaInfo from "../dashboard/messages/MessageMetaInfo";
import { MessageType } from "@/types/MessageType";
import PreviewTemplateMessage from "../dashboard/templates/PreviewTemplateMessage";

interface PreviewMessageBubbleProps {
  message: Message;
  isMine?: boolean;
}

export default function PreviewMessageBubble({ message, isMine = false}: PreviewMessageBubbleProps) {
  const isTemplate: boolean = !!message?.template || message?.type === MessageType.TEMPLATE;
  const isMedia: boolean = !!message?.media || message?.type === MessageType.MEDIA;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`relative max-w-xs lg:max-w-md rounded-lg px-3 py-2 font-segoe text-[14.2px] 
          ${message.context?.id ? "min-w-[200px]" : ""}
          ${
            isMine
              ? "bg-green-100 dark:bg-[#144D37] rounded-tr-none"
              : "bg-white dark:bg-[#2E2F2F] rounded-tl-none"
          }`}
      >
        {/* Main message content */}
        <div className="break-words">
          {isTemplate ? (
            <PreviewTemplateMessage message={message} template={message.template!}/>
          ) : isMedia ? (
            <MediaMessage message={message} />
          ) : (
            <p
              className="break-words whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: formatRichText(message.message ?? "") }}
            />
          )}

          {!isTemplate && <div className="flex justify-end"><MessageMetaInfo message={message} /></div>}
        </div>
      </div>
    </div>
  );
}
