"use client";

import DefaultSettingsPage from "@/components/dashboard/settings/pages/DefaultSettingsPage";
import PaymentHistoryPage from "@/components/dashboard/subscription/PaymentHistory";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsDetailPage() {
  const { selectedSettingsMenu } = useSettingsStore();

  if(selectedSettingsMenu == "payment-history"){
    return <PaymentHistoryPage />
  } else{
    return <DefaultSettingsPage />
  }
}
