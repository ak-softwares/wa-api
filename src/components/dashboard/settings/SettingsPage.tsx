'use client';

import MenuTile from "@/components/common/MenuTile";
import { Button } from "@/components/ui/button";
import { Moon, Search, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export default function SettingsPage() {

    const [openLogout, setOpenLogout] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const { theme, setTheme } = useTheme();

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: "/auth/login" });
    };

    return (
        <div className="bg-white dark:bg-[#161717] min-h-screen border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-5 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Settings</h1>
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white dark:hover:bg-[#252727] hover:bg-gray-200">
                <img src="/assets/icons/more-vertical.svg" className="w-6 h-6 dark:invert" alt="more options" />
                </div>
            </div>
            </div>
            
            {/* Search Bar */}
            <div className="px-5">
                <div className="relative z-10">
                    <Search className="absolute left-3 top-2.5 h-4 w-6 text-gray-500" size={22} strokeWidth={2} />
                    <input
                    type="text"
                    placeholder="Search settings..."
                    className="
                        p-1.5
                        pl-12 rounded-full
                        bg-gray-200 dark:bg-[#2E2F2F]
                        border border-transparent
                        focus:border-2 focus:border-white
                        focus:outline-none
                        placeholder:text-base placeholder:text-gray-400
                        dark:text-white
                        w-full
                    "
                    />
                    {searchTerm && (
                    <Button
                        variant="ghost"
                        onClick={handleClearSearch}
                        className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                    >
                        ✕
                    </Button>
                    )}
                </div>
            </div>
            {/* Settings Content */}
            <div className="p-5 flex-1 overflow-y-auto">
                {/* Example MenuTile */}
                <MenuTile
                    icon={<img src="/assets/icons/setting.svg" className="w-6 h-6 dark:invert" alt="User" />}
                    label="Profile"
                    subtitle="Manage your profile settings"
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
                    onClick={() => setOpenLogout(true)}
                />
                <AlertDialog open={openLogout} onOpenChange={setOpenLogout}>
                <AlertDialogContent className="dark:bg-[#1f1f1f]">
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will be signed out of your account.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                        handleSignOut();
                        }}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Logout
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>

            </div>
        </div>
    );
}
