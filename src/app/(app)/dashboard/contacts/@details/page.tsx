"use client";

import DefaultContactDetailsPage from "@/components/dashboard/contacts/Pages/DefaultContactDetailsPage";
import ExcelImportContactsPage from "@/components/dashboard/contacts/Pages/ExcelImportContactsPage";
import VCFImportContactsPage from "@/components/dashboard/contacts/Pages/VCFImportContactsPage";
import BroadcastPage from "@/components/dashboard/broadcast/BroadcastPage";
import { useContactStore } from "@/store/contactStore";

export default function AiDetailPage() {
  const { selectedContactMenu } = useContactStore();

  if(selectedContactMenu == "broadcast"){
    return <BroadcastPage />
  }else if(selectedContactMenu == "imported-contacts"){
    return <ExcelImportContactsPage />
  } else if( selectedContactMenu == "imported-vcf" ){
    return <VCFImportContactsPage />
  } else{
    return <DefaultContactDetailsPage />
  }
}
