"use client";

import MenuTile from "@/components/common/MenuTile";
import SearchBar from "@/components/common/SearchBar";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useLogoutDialog } from "@/hooks/profile/useLogoutDialog";

export default function SettingssPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const { theme, setTheme } = useTheme();
    const { selectedSettingsMenu, setSelectedSettingsMenu } = useSettingsStore();
    const { openLogoutDialog, LogoutDialog } = useLogoutDialog();
    
    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" });
    };
    
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
              icon={<img src="/assets/icons/setting.svg" className="w-6 h-6 dark:invert" alt="User" />}
              label="Profile"
              subtitle="Manage your profile settings"
              onClick={() => setSelectedSettingsMenu("profile")}
              selected={selectedSettingsMenu === "profile"}
          />
          <MenuTile
              icon={<img src="/assets/icons/key.svg" className="w-6 h-6 dark:invert" alt="User" />}
              label="API Key"
              subtitle="Generate api key here"
              onClick={() => setSelectedSettingsMenu("api-key")}
              selected={selectedSettingsMenu === "api-key"}
          />
          <MenuTile
              icon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              label="Theme"
              subtitle="Click to change theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          <MenuTile
              icon={<img src="/assets/icons/logout.svg" className="w-5 h-5" alt="Logout"
                    style={{ filter: "invert(17%) sepia(86%) saturate(7490%) hue-rotate(1deg) brightness(90%) contrast(100%)" }}
              />}
              label="Logout"
              size="md"
              onClick={openLogoutDialog}
          />
          {/* Logout Dialog Component */}
          {LogoutDialog}
        </div>
      </div>
    );
}