"use client";

import APITokenPage from "@/components/dashboard/settings/APITokenPage";
import DefaultSettingsPage from "@/components/dashboard/settings/DefaultSettingsPage";
import TransactionHistory from "@/components/dashboard/wallet/TransactionHistory";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsDetailPage() {
  const { selectedSettingsMenu } = useSettingsStore();

  if(selectedSettingsMenu == "transaction-history"){
    return <TransactionHistory />
  }else if(selectedSettingsMenu == "api-key"){
    return <APITokenPage />
  } else{
    return <DefaultSettingsPage />
  }
}
