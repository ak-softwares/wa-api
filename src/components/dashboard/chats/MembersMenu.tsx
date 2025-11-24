"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useOpenChat } from "@/hooks/chat/useOpenChat";
import { useEditMembers } from "@/hooks/chat/useEditMembers";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant } from "@/types/Chat";

interface MembersMenuProps {
  member: ChatParticipant;
  onRemove?: (phone: string) => void; // notify parent UI to update list
}

export default function MembersMenu({ member, onRemove }: MembersMenuProps) {
  const router = useRouter();

  const { openChatByContact } = useOpenChat();
  const { removeMembers, loading: removingMember } = useEditMembers();
  const { activeChat } = useChatStore();

  const phone = member.number;

  // --------------------------
  // CHAT
  // --------------------------
  const handleChatClick = () => {
    if (!phone) return;
    openChatByContact(phone);
    router.push("/dashboard/chats");
  };

  // --------------------------
  // REMOVE MEMBER
  // --------------------------
  const handleRemoveMember = async () => {
    if (!activeChat?._id) return;

    const membersToRemove = [{ number: phone }];
    const success = await removeMembers(activeChat._id.toString(), membersToRemove);

    // if (success) {
    //   onRemove?.(phone); // update parent UI
    // }
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

        {/* Remove Member */}
        <DropdownMenuItem
          onClick={handleRemoveMember}
          disabled={removingMember}
          className="text-red-600 dark:text-red-400 hover:dark:bg-[#343636] flex items-center gap-2"
        >
          <img
            src="/assets/icons/delete.svg"
            className="w-5 h-5 dark:invert"
            alt=""
          />
          {removingMember ? "Removing..." : "Remove Member"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
