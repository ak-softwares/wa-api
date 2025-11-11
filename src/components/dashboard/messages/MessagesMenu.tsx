"use client";

import GenericMenu from "@/components/common/DropDownMenu";

interface ContactsMenuProps {
  onContactDetails?: () => void; // ✅ Prop for parent callback
  onCloseChat?: () => void; // ✅ Prop for parent callback
  onDeleteChat?: () => void;
}

export default function MessagesMenu({ onContactDetails, onCloseChat, onDeleteChat }: ContactsMenuProps) {
  const topItems = [
    { icon: "/assets/icons/info.svg", label: "Contact info", action: onContactDetails },
    { icon: "/assets/icons/select.svg", label: "Select messages", action: () => console.log("Select messages") },
    { icon: "/assets/icons/mute-notification.svg", label: "Mute notifications", action: () => console.log("Mute notifications") },
    { icon: "/assets/icons/close-circle.svg", label: "Close chat", action: onCloseChat },
  ];

  const bottomItems = [
    { icon: "/assets/icons/clear.svg", label: "Clear chat", action: () => console.log("Report"), danger: true },
    { icon: "/assets/icons/block.svg", label: "Block", action: () => console.log("Block"), danger: true },
    { icon: "/assets/icons/delete.svg", label: "Delete chat", action: onDeleteChat, danger: true },
  ];

  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;
}