"use client";

import GenericMenu from "@/components/common/DropDownMenu";

interface ContactsMenuProps {
  onSelectAll?: () => void; // ✅ Prop for parent callback
  onMakeBroadcast?: () => void; // ✅ Prop for parent callback
  onDeleteSelected?: () => void; // ✅ Prop for parent callback
  onExportContacts?: () => void; // ✅ Prop for parent callback
}

export default function SelectedContactsMenu({ onSelectAll, onMakeBroadcast, onDeleteSelected, onExportContacts }: ContactsMenuProps) {

  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select All", action: onSelectAll },
    { icon: "/assets/icons/broadcast.svg", label: "Make Broadcast", action: onMakeBroadcast },
    { icon: "/assets/icons/export.svg", label: "Export Contacts", action: onExportContacts },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete Selected", action: onDeleteSelected },
  ];

  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;
}
