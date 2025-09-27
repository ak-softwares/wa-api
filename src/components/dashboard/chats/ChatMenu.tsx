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
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-center">
          <ChevronDown className="hidden group-hover:flex h-4 w-4 text-gray-500" />
        </span>
      </DropdownMenuTrigger>

        {/* <DropdownMenuItem onClick={() => {}}>
          Archive chat
        </DropdownMenuItem> */}

      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem 
          onClick={handleDelete} 
          disabled={deleting} 
          className="text-red-600 dark:text-red-400"
        >
          {deleting ? "Deleting..." : "Delete chat"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
