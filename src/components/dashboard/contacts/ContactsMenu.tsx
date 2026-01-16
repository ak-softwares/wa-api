"use client";

import { useGoogleImport } from "@/hooks/contact/useGoogleImport";
import GenericMenu from "@/components/common/DropDownMenu";
import { useContactStore } from "@/store/contactStore";

interface ContactsMenuProps {
  onSelectContacts?: () => void; // ✅ Prop for parent callback
  onDeleteAllContacts?: () => void; // ✅ Prop for parent callback
}

export default function ContactsMenu({ onSelectContacts, onDeleteAllContacts }: ContactsMenuProps) {

  const { handleGoogleImport, loading } = useGoogleImport();
  const { setSelectedContactMenu } = useContactStore();

  const goToExcelImportPage = () => {
    setSelectedContactMenu("imported-contacts");
  };

  const goToVCFImportPage = () => {
    setSelectedContactMenu("imported-vcf");
  };


  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select Contacts", action: onSelectContacts },
    { icon: "/assets/icons/broadcast.svg", label: "Make Broadcast", action: onSelectContacts },
    { icon: "/assets/icons/document.svg", label: "Import from Excel", action: goToExcelImportPage },
    { icon: "/assets/icons/download.svg", label: "Import from Google", action: handleGoogleImport },
    { icon: "/assets/icons/VCF.svg", label: "Import from VCF", action: goToVCFImportPage },
    { icon: "/assets/icons/export.svg", label: "Export Contacts", action: onSelectContacts },
  ];

  const bottomItems = [
    { icon: "/assets/icons/delete.svg", label: "Delete all contacts", action: onDeleteAllContacts, danger: true },
  ];
  return <GenericMenu topItems={topItems} bottomItems={bottomItems} />;
}
