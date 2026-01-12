// components/chat/MessageMetaInfo.tsx
import React from "react";
import { MessageStatus } from "@/types/MessageType";
import { formatTime } from "@/utiles/formatTime/formatTime";
import { Message } from "@/types/Message";
import { MessageType } from "@/types/MessageType";
import { ChatType } from "@/types/Chat";

interface MessageMetaInfoProps {
  message: Message;
}

export default function MessageMetaInfo({ message }: MessageMetaInfoProps) {

  const isTemplate: boolean = !!message?.template || message?.type === MessageType.TEMPLATE;
    
  return (
    <span className="flex items-center gap-1 text-[11px] text-gray-400 ml-auto mt-1">
      {/* Tag Icons */}
      {message.tag === ChatType.BROADCAST && (
        <img
          src="/assets/icons/broadcast-icon.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="broadcast"
        />
      )}

      {message.tag === "aichat" && (
        <img
          src="/assets/icons/ai-icon.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="ai tag"
        />
      )}

      {message.tag === "aiagent" && (
        <img
          src="/assets/icons/ai-agent-icon.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="ai agent tag"
        />
      )}

      {isTemplate && (
        <img
          src="/assets/icons/template.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="template tag"
        />
      )}

      {/* Time */}
      {formatTime(message.createdAt)}

      {/* Status Icons */}
      {message.status === MessageStatus.Pending && (
        <img
          src="/assets/icons/msg-time.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="pending"
        />
      )}

      {message.status === MessageStatus.Failed && (
        <img
          src="/assets/icons/warning.svg"
          className="w-4 h-4"
          alt="failed"
        />
      )}

      {(message.status === MessageStatus.Sent) && (
        <img
          src="/assets/icons/status-check.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="sent/delivered"
        />
      )}

      {(message.status === MessageStatus.Delivered) && (
        <img
          src="/assets/icons/status-dblcheck.svg"
          className="w-4 h-4 dark:invert opacity-60"
          alt="sent/delivered"
        />
      )}

      {message.status === MessageStatus.Read && (
        <img
          src="/assets/icons/status-dblcheck-1.svg"
          className="w-4 h-4"
          alt="read"
        />
      )}
    </span>
  );
}