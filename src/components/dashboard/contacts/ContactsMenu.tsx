"use client";

import { useGoogleImport } from "@/hooks/contact/useGoogleImport";
import { useRouter } from "next/navigation";
import GenericMenu from "@/components/common/DropDownMenu";
import { useContactStore } from "@/store/contactStore";

interface ContactsMenuProps {
  onSelectContacts?: () => void; // ✅ Prop for parent callback
}

export default function ContactsMenu({ onSelectContacts }: ContactsMenuProps) {

  const router = useRouter();
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
    { icon: "/assets/icons/download.svg", label: "Import from Google", action: handleGoogleImport },
    { icon: "/assets/icons/document.svg", label: "Import from Excel", action: goToExcelImportPage },
    { icon: "/assets/icons/VCF.svg", label: "Import from VCF", action: goToVCFImportPage },
    { icon: "/assets/icons/export.svg", label: "Export Contacts", action: onSelectContacts },
  ];

  return <GenericMenu topItems={topItems} />;
}
