"use client";

import GenericMenu from "@/components/common/DropDownMenu";

interface ContactsMenuProps {
  onSelectAll?: () => void; // ✅ Prop for parent callback
  onDeleteSelected?: () => void; // ✅ Prop for parent callback
}

export default function SelectedChatMenu({ onSelectAll, onDeleteSelected }: ContactsMenuProps) {

  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select All", action: onSelectAll },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete Selected", action: onDeleteSelected, danger: true },
  ];

  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;

}
