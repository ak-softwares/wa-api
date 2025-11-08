"use client";

import { useRouter } from "next/navigation";
import { Bot, Users2, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import IconButton from "@/components/common/IconButton";
import MenuTile from "@/components/common/MenuTile";
import SearchBar from "@/components/common/SearchBar";

export default function AiPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          AI Menu <span className="text-gray-500 text-sm"></span>
        </h1>
      </div>
      
      {/* Search Bar */}
      <SearchBar
        placeholder="Search menu..."
      />

      {/* Menu Sections */}
      <div className="space-y-2 px-5">
        {/* Example MenuTile */}
        <MenuTile
            icon={<img src="/assets/icons/broadcast.svg" className="w-6 h-6 dark:invert" alt="User" />}
            label="Ai Chat"
            subtitle="Talk with your AI assistant"
        />
        <MenuTile
            icon={<img src="/assets/icons/ai.svg" className="w-6 h-6 dark:invert" alt="User" />}
            label="Ai Agent"
            subtitle="Automate tasks using AI agents"
        />
      </div>
    </div>
  );
}
