"use client";

import GenericMenu from "@/components/common/DropDownMenu";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";
import { useChatStore } from "@/store/chatStore";
import { ChatParticipant } from "@/types/Chat";

interface ContactsMenuProps {
  onContactDetails?: () => void;
  onCloseChat?: () => void;
  onDeleteChat?: () => void;
  onToggleFavourite?: () => void;
  isFavourite?: boolean;
}

export default function MessagesMenu({
  onContactDetails,
  onCloseChat,
  onDeleteChat,
  onToggleFavourite,
  isFavourite = false,
}: ContactsMenuProps) {
  const { activeChat } = useChatStore();
  const isBroadcast = activeChat?.type === "broadcast";
  const { isBlocked, confirmBlock, confirmUnblock, ConfirmDialog } = useBlockedContacts();

  // ⭐ Convert activeChat participant → ChatParticipant
  const participant: ChatParticipant | null =
    !isBroadcast && activeChat?.participants?.length
      ? activeChat.participants[0]
      : null;

  // ⭐ Dynamic Block / Unblock menu entry
  const blockItem =
    participant && isBlocked(participant)
      ? {
          icon: "/assets/icons/block.svg",
          label: "Unblock",
          action: () => confirmUnblock(participant),
          danger: false,
        }
      : {
          icon: "/assets/icons/block.svg",
          label: "Block",
          action: () => {
            if (participant) confirmBlock(participant);
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


    return (
    <>
      {/* 🔥 Required for block / unblock confirmation */}
      <ConfirmDialog />

      <GenericMenu topItems={topItems} bottomItems={bottomItems} />
    </>
  );
}
