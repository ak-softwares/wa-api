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

interface ChatMenuProps {
  chatId: string;
  onDelete?: (chatId: string) => void; // new callback
}

export default function ChatMenu({ chatId, onDelete }: ChatMenuProps) {

  const [deleting, setDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // ✅ prevent menu from closing immediately
        e.stopPropagation();
        setDeleting(true);
        try {
          const res = await fetch(`/api/whatsapp/chats/${chatId}`, {
            method: "DELETE",
          });
    
          const json: ApiResponse = await res.json();
          if (json.success) {
            toast.success(`Chat deleted successfully`);
            onDelete?.(chatId); // ✅ call callback to remove chat from list
          } else {
            toast.error(json.message || "Failed to delete chat");
          }
        } catch (err) {
          toast.error("Error deleting chat");
        } finally {
          setDeleting(false);
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
