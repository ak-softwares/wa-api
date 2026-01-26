"use client";

import DefaultSettingsPage from "@/components/dashboard/settings/pages/DefaultSettingsPage";
import TransactionHistory from "@/components/dashboard/wallet/TransactionHistory";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsDetailPage() {
  const { selectedSettingsMenu } = useSettingsStore();

  if(selectedSettingsMenu == "transaction-history"){
    return <TransactionHistory />
  } else{
    return <DefaultSettingsPage />
  }
}
