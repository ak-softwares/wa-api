"use client";

import MenuTile from "@/components/common/MenuTile";
import SearchBar from "@/components/common/SearchBar";
import { useAiStore } from "@/store/aiStore";

export default function AiPage() {
  const { selectedAiMenu, setSelectedAiMenu } = useAiStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          AI Chat <span className="text-gray-500 text-sm"></span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="px-5 mb-3">
        <SearchBar placeholder="Search menu..." />
      </div>

      {/* Menu Sections */}
      <div className="space-y-2 px-5">
        <MenuTile
          icon={
            <img
              src="/assets/icons/ai-icon.svg"
              className="w-7 h-7 dark:invert"
              alt="AI Chat Icon"
            />
          }
          label="AI Chat"
          subtitle="Talk with your AI assistant"
          onClick={() => setSelectedAiMenu("ai-chat")}
          selected={selectedAiMenu === "ai-chat"}
        />

        <MenuTile
          icon={
            <img
              src="/assets/icons/ai.svg"
              className="w-6 h-6 dark:invert"
              alt="AI Agent Icon"
            />
          }
          label="AI Agent"
          subtitle="Automate tasks using AI agents"
          onClick={() => setSelectedAiMenu("ai-agent")}
          selected={selectedAiMenu === "ai-agent"}
        />
      </div>
    </div>
  );
}
