"use client";

import GenericMenu from "@/components/common/DropDownMenu";

interface ChatsMenuProps {
  onSelectChats?: () => void; // ✅ Prop for parent callback
  onMakeBroadcast?: () => void;
}

export default function ChatsMenu({ onSelectChats, onMakeBroadcast }: ChatsMenuProps) {
  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select Chats", action: onSelectChats },
    { icon: "/assets/icons/broadcast.svg", label: "Make Broadcast", action: onMakeBroadcast },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete chats", action: onSelectChats, danger: true },
  ];

  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;
}
