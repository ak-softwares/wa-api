"use client";

import GenericMenu from "@/components/common/DropDownMenu";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant, ChatType } from "@/types/Chat";

interface ContactsMenuProps {
  onContactDetails?: () => void;
  onCloseChat?: () => void;
  onDeleteChat?: () => void;
  onToggleFavourite?: () => void;
  isFavourite?: boolean;
  onBlockToggle?: () => void;
  isBlocked?: boolean;
}

export default function MessagesMenu({
  onContactDetails,
  onCloseChat,
  onDeleteChat,
  onToggleFavourite,
  isFavourite = false,
  onBlockToggle,
  isBlocked,
}: ContactsMenuProps) {
  const { activeChat } = useChatStore();
  const isBroadcast = activeChat?.type === ChatType.BROADCAST;

  // ⭐ Convert activeChat participant → ChatParticipant
  const participant: ChatParticipant | null =
    !isBroadcast && activeChat?.participants?.length
      ? activeChat.participants[0]
      : null;

  // ⭐ Dynamic Block / Unblock menu entry
  const blockItem =
    isBlocked
      ? {
          icon: "/assets/icons/block.svg",
          label: "Unblock",
          action: () => onBlockToggle?.(),
          danger: false,
        }
      : {
          icon: "/assets/icons/block.svg",
          label: "Block",
          action: () => {
            if (participant) onBlockToggle?.();
          },
          danger: true,
        };

  const topItems = [
    { icon: "/assets/icons/info.svg", label: "Contact info", action: onContactDetails },
    { icon: "/assets/icons/select.svg", label: "Select messages", action: () => console.log("Select messages") },
    { icon: "/assets/icons/mute-notification.svg", label: "Mute notifications", action: () => console.log("Mute notifications") },
    {
      icon: isFavourite
        ? "/assets/icons/favourite-remove.svg"
        : "/assets/icons/favourite.svg",
      label: isFavourite ? "Remove from favourites" : "Add to favourites",
      action: onToggleFavourite,
    },
    { icon: "/assets/icons/close-circle.svg", label: "Close chat", action: onCloseChat },
  ];

  const bottomItems = [
    {
      icon: "/assets/icons/clear.svg",
      label: "Clear chat",
      action: () => console.log("Clear chat"),
      danger: true,
    },
  ];

  // 👉 Only add Block/Unblock when NOT broadcast + participant exists
  if (!isBroadcast && participant) {
    bottomItems.push(blockItem);
  }

  bottomItems.push({
    icon: "/assets/icons/delete.svg",
    label: "Delete chat",
    action: () => onDeleteChat?.(),
    danger: true,
  });


    return (<GenericMenu topItems={topItems} bottomItems={bottomItems} />);
}
