"use client";

import APITokenPage from "@/components/dashboard/settings/APITokenPage";
import BlockedContactsPage from "@/components/dashboard/settings/BlockedContactsPage";
import DefaultSettingsPage from "@/components/dashboard/settings/DefaultSettingsPage";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsDetailPage() {
  const { selectedSettingsMenu } = useSettingsStore();

  if(selectedSettingsMenu == "api-key"){
    return <APITokenPage />
  } else{
    return <DefaultSettingsPage />
  }
}
