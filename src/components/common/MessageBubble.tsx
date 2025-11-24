"use client";

import { formatTime } from "@/utiles/formatTime/formatTime";
import { Message } from "@/types/Message";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant } from "@/types/Chat";
import { useEffect, useState } from "react";
import MessageMenu from "../dashboard/messages/MessageMenu";
import { useDeleteMessages } from "@/hooks/message/useDeleteMessages";
import { toast } from "../ui/sonner";
import { MessageStatus } from "@/types/MessageStatus";
import { useOpenChat } from "@/hooks/chat/useOpenChat";
import ForwardMessagePopup from "../dashboard/messages/ForwardMessagePopup";
import ForwardMessagePopupToPhone from "../dashboard/messages/ForwardMessagePopupPhone";

interface MessageBubbleProps {
  message: Message;
  onDelete?: (messageId: string) => void; // new callback
  onReply?: () => void; // new callback
}

export default function MessageBubble({ message, onDelete, onReply }: MessageBubbleProps) {
  const activeChat = useChatStore((s) => s.activeChat);
  const [hovered, setHovered] = useState(false);
  const { deleteMessage, deleteMessagesBulk, deleting } = useDeleteMessages();
  const { openChatByContact } = useOpenChat();
  const [isForwardMessageOpen, setIsForwardMessageOpen] = useState(false);

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

  if (!activeChat) return null;

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

  const forwardMessage = () => {
    setIsForwardMessageOpen(true);
  };


  const menuItems = [
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
      action: () => console.log("Copy"),
    },
    {
      icon: "/assets/icons/forward.svg",
      label: "Forward",
      action: forwardMessage,
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

    // ✅ Format message text
  const formatMessageText = (text: string) => {
 
    // Match URLs (handles long query params, %5F etc.)
    const urlRegex = /(https?:\/\/[^\s"']+)/g;
    const phoneRegex = /(\+?\d[\d\s-]{8,}\d)/g;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const boldRegex = /\*([^*]+)\*/g;

    let formatted = text 
      // ✅ Convert full URLs to links
      .replace(
        urlRegex,
        (url) => {
          return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="dark:text-[#21C063] text-blue-600 underline break-all">${url}</a>`;
        }
      );

      // 2️⃣ Now apply phone/email/bold only OUTSIDE <a ...>...</a>
      formatted = formatted.replace(/(<a[^>]*>.*?<\/a>)|([^<]+)/g, (match, link, textPart) => {
        // If this part is a link → do NOT touch it
        if (link) return link;

        // If it's normal text → apply phone/email/bold
        return textPart
          // ✅ Convert phone numbers (e.g., +91 92583 44427 → WhatsApp link)
          .replace(phoneRegex, (num: string) => {
            const clean = num.replace(/\D/g, "");
            return `<b class="chat-number text-walink" data-phone="${clean}" style="cursor:pointer">${num}</b>`;
          })

          .replace(emailRegex, (email: string) =>
            `<a href="mailto:${email}" class="dark:text-[#21C063] text-blue-600">${email}</a>`
          )
          .replace(boldRegex, "<b>$1</b>");
      });

    return formatted;
  };


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
        {message.context?.id && (
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
                { isMineContext ? "You" : activeChat.participants[0].name}
              </p>
              <p className="text-gray-700 dark:text-gray-400 text-sm line-clamp-1">
                {message.context?.message}
              </p>
            </div>
          </div>
        )}
        <p className="break-words">
          {/* ✅ Message content with formatting */}
          <p
            className="break-words"
            dangerouslySetInnerHTML={{ __html: formatMessageText(message.message) }}
          />
          <span className="text-[11px] text-gray-400 float-right ml-2 mt-1 flex items-center gap-1">
            {/* Tag Icon */}
            {message.tag === "broadcast" && (
              <img
                src="/assets/icons/broadcast-icon.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="broadcast"
              />
            )}

            {(message.tag === "aichat") && (
              <img
                src="/assets/icons/ai-icon.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}
            {(message.tag === "aiagent") && (
              <img
                src="/assets/icons/ai-agent-icon.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}

            {/* Time */}
            {formatTime(message.createdAt)}

            {(message.status === MessageStatus.Pending) && (
              <img
                src="/assets/icons/msg-time.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}
            {(message.status === MessageStatus.Failed) && (
              <img
                src="/assets/icons/warning.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}
            {(message.status === MessageStatus.Sent) && (
              <img
                src="/assets/icons/status-dblcheck.svg"  //status-check.svg
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}
            {(message.status === MessageStatus.Delivered) && (
              <img
                src="/assets/icons/status-dblcheck.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}
            {(message.status === MessageStatus.Read) && (
              <img
                src="/assets/icons/status-dblcheck-1.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}
          </span>
        </p>

        <div
          className={`absolute top-0 right-0 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <MessageMenu isMine={isMine} items={menuItems} />
          {/* New Chat Popup */}
          <ForwardMessagePopup
            isOpen={isForwardMessageOpen}
            onClose={() => setIsForwardMessageOpen(false)}
            message={message}
          />
        </div>
      </div>
    </div>
  );
}
