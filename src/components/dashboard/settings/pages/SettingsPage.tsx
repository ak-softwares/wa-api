"use client";

import MenuTile from "@/components/common/MenuTile";
import SearchBar from "@/components/common/SearchBar";
import { useTheme } from "next-themes";
import { History, Moon, Sun } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useLogoutDialog } from "@/hooks/profile/useLogoutDialog";
import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog";
import { useState } from "react";
import { SupportDialog } from "@/components/common/dialog/SupportDialog";

export default function SettingsPage() {
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const { logout } = useLogoutDialog();


  const { theme, setTheme } = useTheme();
  const { selectedSettingsMenu, setSelectedSettingsMenu } = useSettingsStore();
  const [openSupportDialog, setOpenSupportDialog] = useState(false);
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          Settings <span className="text-gray-500 text-sm"></span>
        </h1>
      </div>
      
      {/* Search Bar */}
      <SearchBar
        placeholder="Search settings..."
      />

      {/* Menu Sections */}
      <div className="space-y-2 px-5">
        {/* Example MenuTile */}
        <MenuTile
          icon={<img src="/assets/icons/money.svg" className="w-6 h-6 dark:invert" alt="money" />}
          // icon={<img src="/assets/icons/setting.svg" className="w-6 h-6 dark:invert" alt="User" />}
          label="Payment history"
          subtitle="View and manage your payments"
          onClick={() => setSelectedSettingsMenu("transaction-history")}
          selected={selectedSettingsMenu === "transaction-history"}
        />
        <MenuTile
          icon={<img src="/assets/icons/block.svg" className="w-6 h-6 dark:invert" alt="User" />}
          label="Blocked contacts"
          subtitle="Manage who can message you"
          onClick={() => setSelectedSettingsMenu("blocked-contacts")}
          selected={selectedSettingsMenu === "blocked-contacts"}
        />
        <MenuTile
          icon={theme === "dark" ? <Sun /> : <Moon/>}
          label="Theme"
          subtitle="Click to change theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
        <MenuTile
          icon={<img src="/assets/icons/support.svg" className="w-6 h-6 dark:invert" alt="support"/>}
          label="Help and support"
          subtitle="Call, WhatsApp or Email for quick help"
          onClick={() => setOpenSupportDialog(true)}
        />
        <MenuTile
          icon={<img src="/assets/icons/logout.svg" className="w-6 h-6 ml-1" alt="Logout"
            style={{ filter: "invert(17%) sepia(86%) saturate(7490%) hue-rotate(1deg) brightness(90%) contrast(100%)" }}
          />}
          label="Logout"
          size="md"
          onClick={() => setOpenLogoutDialog(true)}
        />
        {/* Help and support dialog */}
        <SupportDialog
          open={openSupportDialog}
          onClose={() => setOpenSupportDialog(false)}
        />
        {/* Logout Dialog Component */}
        <ConfirmDialog
          open={openLogoutDialog}
          title={"Logout"}
          description="Are you sure you want to logout from your account?"
          onCancel={() => setOpenLogoutDialog(false)}
          onConfirm={logout}
        />
      </div>
    </div>
  );
}