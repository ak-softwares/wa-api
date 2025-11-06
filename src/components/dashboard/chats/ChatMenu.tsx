"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ApiResponse } from "@/types/apiResponse";
import { toast } from "@/components/ui/sonner";
import { Trash } from "lucide-react";
import { useDeleteChats } from "@/hooks/chat/useDeleteChats";

interface ChatMenuProps {
  chatId: string;
  onDelete?: (chatId: string) => void; // new callback
}

export default function ChatMenu({ chatId, onDelete }: ChatMenuProps) {

  const { deleteChat, deleteChatsBulk, deleting } = useDeleteChats();

  const handleDelete = async () => {
    if (!chatId) return;
    const success = await deleteChat(chatId);
    if (success) {
      onDelete?.(chatId); // ✅ refresh or remove from UI
    }
  };
      
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span
        onClick={(e) => e.stopPropagation()} // ✅ stop click from reaching parent 
        className="rounded-full cursor-pointer flex items-center justify-center">
        {/* Reserve space always */}
        <span className="h-6 flex items-center justify-center">
          <ChevronDown
            className="hidden group-hover:flex h-6 w-6 text-gray-400"
            strokeWidth={2}
          />
        </span>
        </span>
      </DropdownMenuTrigger>

        {/* <DropdownMenuItem onClick={() => {}}>
          Archive chat
        </DropdownMenuItem> */}

      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="dark:bg-[#161717]">
        <DropdownMenuItem 
          onClick={handleDelete} 
          disabled={deleting} 
          className="text-red-600 dark:text-red-400 hover:text-red-600 hover:dark:bg-[#343636]"
        >
          <Trash className="w-4 h-4" />
          {deleting ? "Deleting..." : "Delete chat"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
