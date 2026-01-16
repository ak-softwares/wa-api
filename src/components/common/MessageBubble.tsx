"use client";

import { Message } from "@/types/Message";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant } from "@/types/Chat";
import { useEffect, useState } from "react";
import MessageMenu from "../dashboard/messages/MessageMenu";
import { useDeleteMessages } from "@/hooks/message/useDeleteMessages";
import { toast } from "../ui/sonner";
import { useOpenChat } from "@/hooks/chat/useOpenChat";
import { MessageType } from "@/types/MessageType";
import TemplateMessage from "../dashboard/templates/RenderTemplateMessage";
import { formatRichText } from "./FormatRichText";
import MessageMetaInfo from "../dashboard/messages/MessageMetaInfo";
import MediaMessage from "../dashboard/templates/RenderMediaMessage";
import LocationMessage from "../dashboard/templates/RenderLocationMessage";
import { fetchMediaBlob } from "@/services/message/media.service";

interface MessageBubbleProps {
  message: Message;
  onDelete?: (messageId: string) => void; // new callback
  onReply?: () => void; // new callback
  onForward?: () => void; // new callback
  onInfo?: () => void;
  isPreviewMode?: boolean; // new prop
}

export default function MessageBubble({ message, onDelete, onReply, onForward, onInfo, isPreviewMode }: MessageBubbleProps) {
  const activeChat = useChatStore((s) => s.activeChat);
  const [hovered, setHovered] = useState(false);
  const { deleteMessage } = useDeleteMessages();
  const { openChatByContact } = useOpenChat();
  
  const isTemplate: boolean = !!message?.template || message?.type === MessageType.TEMPLATE;
  const isMedia: boolean = !!message?.media || message?.type === MessageType.MEDIA;
  const isLocation: boolean = !!message?.location || message?.type === MessageType.LOCATION;

  const isMine = !activeChat?.participants?.some(
    (p: ChatParticipant) => p.number === message.from
  );

  const isMineContext =
    !!message.context?.from &&
    !!activeChat?.participants?.length &&
    message.context.from !== activeChat.participants[0].number;

  
  useEffect(() => {
    const handler = (e: any) => {
      const el = e.target.closest(".chat-number");
      if (el) {
        const phone = el.getAttribute("data-phone");
        openChatByContact(phone);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleDelete = async () => {
    if (!message._id) return;
    const success = await deleteMessage(message._id!.toString());
    if (success) {
      onDelete?.(message._id!.toString()); // ✅ refresh or remove from UI
    }
  };

  const copyMessageText = () => {
    if (!message?.message) return;

    const fullText = message.message;

    // Extract first 4–5 words for toast preview
    const words = fullText.trim().split(/\s+/);
    const preview =
      words.length > 5 ? words.slice(0, 5).join(" ") + "..." : fullText;

    navigator.clipboard.writeText(fullText);
    toast.success("Message copied: " + preview);
  };

  const handleDownload = async (mediaId?: string, fileName?: string) => {
    try {
      if (!mediaId) return;

      // fetch actual media URL
      const mediaUrl = await fetchMediaBlob(mediaId);
      if (!mediaUrl) throw new Error("Media not found");

      // trigger download
      const a = document.createElement("a");
      a.href = mediaUrl;
      a.download = fileName || "file";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      toast.error("Failed to download file");
    }
  };

  const menuItems = [
    {
      icon: "/assets/icons/info.svg",
      label: "Info",
      action: onInfo,
    },
    {
      icon: "/assets/icons/reply.svg",
      label: "Reply",
      action: onReply,
    },
    {
      icon: "/assets/icons/copy.svg",
      label: "Copy",
      action: copyMessageText,
    },
    {
      icon: "/assets/icons/react.svg",
      label: "React",
      action: () => console.log("Copy"),
    },
    {
      icon: "/assets/icons/download.svg",
      label: "Download",
      action: () => handleDownload(message?.media?.id, message.media?.filename),
    },
    {
      icon: "/assets/icons/forward.svg",
      label: "Forward",
      action: onForward,
    },
    {
      icon: "/assets/icons/pin.svg",
      label: "Pin",
      action: () => console.log("Copy"),
    },
    {
      icon: "/assets/icons/delete.svg",
      label: "Delete",
      action: handleDelete,
      danger: true,
    },
  ];

  return (
    <div
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      <div
        className={`relative max-w-xs lg:max-w-md rounded-lg px-3 py-2 font-segoe text-[14.2px] 
          ${message.context?.id ? "min-w-[200px]" : ""}
          ${
          isMine
            ? "bg-green-100 dark:bg-[#144D37] rounded-tr-none"
            : "bg-white dark:bg-[#2E2F2F] rounded-tl-none" 
        }`}
      >
        {/* PREFIX buttons (left side inside input) */}
        {message.context?.id && !isPreviewMode && (
          <div 
          className={`-mx-2 -mt-1 mb-1 px-2 py-2
            rounded-md border-l-4 flex justify-between items-start
            ${
              isMine
                ? "bg-green-200 dark:bg-[#103D2C]"
                : "bg-gray-100 dark:bg-[#1C1E1E]"
            }
            ${
              isMineContext 
                ? "border-[#06CF9C] dark:border-[#06CF9C]"
                : "border-[#53BDEB] dark:border-[#53BDEB]"
            }
          `}>
            <div>
              <p className={`font-semibold text-sm
                  ${
                    isMineContext 
                      ? "text-[#04A37A] dark:text-[#06CF9C]"
                      : "text-[#4198BD] dark:text-[#53BDEB]"
                  }
                `}>
                { isMineContext ? "You" : activeChat?.participants[0].name}
              </p>
              <p className="text-gray-700 dark:text-gray-400 text-sm line-clamp-1">
                {message.context?.message}
              </p>
            </div>
          </div>
        )}
        <div className="break-words">
          {/* ✅ Message content with formatting */}
          {/* TEMPLATE RENDER */}
          {isTemplate ? (
            <TemplateMessage message={message} template={message.template!} />
          ) : isMedia ? (
            <MediaMessage message={message} />
          ) : isLocation ? (
            <LocationMessage message={message} />   // 👈 NEW BLOCK
          ) : (
            <p
              className="break-words whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: formatRichText(message.message ?? "")
              }}
            />
          )}
          { !isTemplate && (
            <div className="flex justify-end">
              <MessageMetaInfo message={message} />
            </div>
          )}
        </div>

        {!isPreviewMode && (
          <div
            className={`absolute top-0 right-0 transition-opacity ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <MessageMenu isMine={isMine} items={menuItems} />
          </div>
        )}
      </div>
    </div>
  );
}
