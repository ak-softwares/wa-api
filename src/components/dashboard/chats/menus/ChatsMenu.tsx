"use client";

import GenericMenu from "@/components/common/DropDownMenu";
import { useChatMenuStore } from "@/store/chatMenu";

interface ChatsMenuProps {
  onSelectChats?: () => void; // ✅ Prop for parent callback
  onDeleteAllChats?: () => void; // ✅ Prop for parent callback
}

export default function ChatsMenu({ onSelectChats, onDeleteAllChats }: ChatsMenuProps) {
  const { setChatMenu } = useChatMenuStore();
  
  const goToBroadcastPage = () => {
    setChatMenu("broadcast");
  };

  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select Chats", action: onSelectChats },
    { icon: "/assets/icons/broadcast.svg", label: "Make Broadcast", action: goToBroadcastPage },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete all chats", action: onDeleteAllChats, danger: true },
  ];

  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;
}
