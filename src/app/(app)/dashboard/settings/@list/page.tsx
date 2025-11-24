"use client";

import BlockedContactsPage from "@/components/dashboard/settings/BlockedContactsPage";
import SettingsPage from "@/components/dashboard/settings/SettingsPage";
import { useSettingsStore } from "@/store/settingsStore";

export default function SettingsDetailPage() {
  const { selectedSettingsMenu } = useSettingsStore();

  if(selectedSettingsMenu == "blocked-contacts"){
    return <BlockedContactsPage />
  } else{
    return <SettingsPage />
  }
}
