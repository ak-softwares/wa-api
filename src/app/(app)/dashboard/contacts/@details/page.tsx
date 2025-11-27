"use client";

import DefaultContactDetailsPage from "@/components/dashboard/contacts/DefaultContactDetailsPage";
import ExcelImportContactsPage from "@/components/dashboard/contacts/ExcelImportContactsPage";
import VCFImportContactsPage from "@/hooks/contact/VCFImportContactsPage";
import { useContactStore } from "@/store/contactStore";

export default function AiDetailPage() {
  const { selectedContactMenu } = useContactStore();

  if(selectedContactMenu == "imported-contacts"){
    return <ExcelImportContactsPage />
  } else if( selectedContactMenu == "imported-vcf" ){
    return <VCFImportContactsPage />
  } else{
    return <DefaultContactDetailsPage />
  }
}
