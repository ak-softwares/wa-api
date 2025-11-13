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
          {message.message}
          <span className="text-[11px] text-gray-400 float-right ml-2 mt-2">
            {message.tag ? `${message.tag} ` : ""}
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
