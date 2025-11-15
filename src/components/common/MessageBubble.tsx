"use client";

import { formatTime } from "@/utiles/formatTime/formatTime";
import { Message } from "@/types/Message";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant } from "@/types/Chat";
import { useState } from "react";
import MessageMenu from "../dashboard/messages/MessageMenu";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const selectedChat = useChatStore((s) => s.activeChat);
  const [hovered, setHovered] = useState(false);

  const isMine = !selectedChat?.participants?.some(
    (p: ChatParticipant) => p.number === message.from
  );

  if (!selectedChat) return null;

  const menuItems = [
    {
      icon: "/assets/icons/reply.svg",
      label: "Reply",
      action: () => console.log("Reply"),
    },
    {
      icon: "/assets/icons/copy.svg",
      label: "Copy",
      action: () => console.log("Copy"),
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
      action: () => console.log("Copy"),
    },
    {
      icon: "/assets/icons/pin.svg",
      label: "Pin",
      action: () => console.log("Copy"),
    },
    {
      icon: "/assets/icons/delete.svg",
      label: "Delete",
      action: () => console.log("Delete"),
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
          .replace(phoneRegex, (num: string) =>
            `<b><a href="https://wa.me/${num.replace(/\D/g, "")}" target="_blank" class="dark:text-[#21C063] text-blue-600">${num}</a></b>`
          )
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
        className={`relative max-w-xs lg:max-w-md rounded-lg px-3 py-2 font-segoe text-[14.2px] ${
          isMine
            ? "bg-green-100 dark:bg-[#144D37] rounded-tr-none"
            : "bg-white dark:bg-[#2E2F2F] rounded-tl-none"
        }`}
      >
        <p className="break-words">
          {/* ✅ Message content with formatting */}
          <p
            className="break-words"
            dangerouslySetInnerHTML={{ __html: formatMessageText(message.message) }}
          />
          <span className="text-[11px] text-gray-400 float-right ml-2 mt-2 flex items-center gap-1">
            {/* Tag Icon */}
            {message.tag === "broadcast" && (
              <img
                src="/assets/icons/broadcast-icon.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="broadcast"
              />
            )}

            {(message.tag === "aichat" || message.tag === "aiagent") && (
              <img
                src="/assets/icons/ai-icon.svg"
                className="w-4 h-4 dark:invert opacity-60"
                alt="ai tag"
              />
            )}

            {/* Time */}
            {formatTime(message.createdAt)}
          </span>

        </p>

        <div
          className={`absolute top-0 right-0 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <MessageMenu isMine={isMine} items={menuItems} />
        </div>
      </div>
    </div>
  );
}
