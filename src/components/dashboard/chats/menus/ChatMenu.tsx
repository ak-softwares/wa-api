"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import MenuItemsList from "@/components/common/MenuItemList";
import { Chat, ChatParticipant, ChatType } from "@/types/Chat";
import { useFavourite } from "@/hooks/chat/useFavourite";

interface ChatMenuProps {
  chat: Chat;
  onDelete?: (chat: Chat) => void; // new callback
  onUpdateFavourite?: (chatId: string, isFavourite: boolean) => void; // added
  onBlockToggle?: (participant: ChatParticipant) => void;  // ✅ fixed
  isBlocked?: boolean;   // ✅ NOW BOOLEAN
}

export default function ChatMenu({ chat, onDelete, onUpdateFavourite, onBlockToggle, isBlocked }: ChatMenuProps) {

  const { toggleFavourite } = useFavourite();

  const isBroadcast = chat?.type === ChatType.BROADCAST;
  const participant: ChatParticipant = chat.participants[0]; // assuming one-on-one chat

  const handleToggleFavourite = async () => {
    const updatedState = await toggleFavourite(chat._id!.toString());
    if (updatedState !== null) {
      // Optional: update UI state or refresh
      onUpdateFavourite?.(chat._id!.toString(), updatedState);
    }
  };
      
  const topItems = [
    chat.isFavourite
      ? { 
          icon: "/assets/icons/favourite-remove.svg", 
          label: "Remove from favourites",
          action: () => handleToggleFavourite()
        }
      : { 
          icon: "/assets/icons/favourite.svg", 
          label: "Add to favourites",
          action: () => handleToggleFavourite()
        }
  ];

  // Build bottomItems safely, never adding null

  const bottomItems: any[] = [];

  // ⭐ Add Block/Unblock only if participant exists (not broadcast)
  if (!isBroadcast) {
    bottomItems.push(
      isBlocked
        ? {
            icon: "/assets/icons/block.svg",
            label: "Unblock",
            danger: false,
            action: () => onBlockToggle?.(participant),
          }
        : {
            icon: "/assets/icons/block.svg",
            label: "Block",
            danger: true,
            action: () => onBlockToggle?.(participant),
          }
    );
  }

  // ⭐ Always add Delete Chat
  bottomItems.push({
    icon: "/assets/icons/delete.svg",
    label: "Delete chat",
    action: () => onDelete?.(chat),
    danger: true,
  });


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
        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="dark:bg-[#161717] min-w-[220px] rounded-xl p-2"
        >
          {/* 🔹 Top Section */}
          <MenuItemsList items={topItems} />

          {/* 🔸 Separator */}
          {bottomItems.length > 0 && <DropdownMenuSeparator className="dark:bg-[#2A2A2A] my-1" />}

          {/* 🔻 Bottom Section */}
          <MenuItemsList items={bottomItems} />
        </DropdownMenuContent>
      </DropdownMenu>
  );
}
