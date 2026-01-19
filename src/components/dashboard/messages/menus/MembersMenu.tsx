"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useFindOrCreateChat } from "@/hooks/chat/useFindOrCreateChat";
import { ChatParticipant } from "@/types/Chat";

interface MembersMenuProps {
  member: ChatParticipant;
  onRemove?: (phone: string) => void; // notify parent UI to update list
}

export default function MembersMenu({ member, onRemove }: MembersMenuProps) {
  const router = useRouter();

  const { findOrCreateChat } = useFindOrCreateChat();

  const phone = member.number;

  // --------------------------
  // CHAT
  // --------------------------
  const handleChatClick = () => {
    if (!phone) return;
    findOrCreateChat({ participant: member});
    router.push("/dashboard/chats");
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <span
          onClick={(e) => e.stopPropagation()}
          className="rounded-full cursor-pointer flex items-center justify-center"
        >
          <span className="h-6 flex items-center justify-center">
            <ChevronDown
              className="hidden group-hover:flex h-6 w-6 text-gray-400"
              strokeWidth={2}
            />
          </span>
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
        className="dark:bg-[#161717]"
      >
        {/* Chat */}
        <DropdownMenuItem
          onClick={handleChatClick}
          className="flex items-center gap-2 hover:dark:bg-[#343636]"
        >
          <img
            src="/assets/icons/chat-add.svg"
            className="w-5 h-5 dark:invert"
            alt=""
          />
          Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
