"use client";

import MenuTile from "@/components/common/MenuTile";
import SearchBar from "@/components/common/SearchBar";
import { showToast } from "@/components/ui/sonner";
import { useAiStore } from "@/store/aiStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AiPage() {
  const { selectedAiMenu, setSelectedAiMenu } = useAiStore();

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    const toolName = searchParams.get("connected");

    if (toolName) {
      console.log("tool name : " + toolName)
      showToast.success(`${toolName} connected successfully!`);

      // ✅ remove query params without reload
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

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
              src="/assets/icons/sub-menu/link.svg"
              className="w-6 h-6 dark:invert"
              alt="Tools integration"
            />
          }
          label="Tools Integrations"
          subtitle="Connect WooCommerce, Shopify, Sheets & more."
          onClick={() => setSelectedAiMenu("tools")}
          selected={selectedAiMenu === "tools"}
        />          
        <MenuTile
          icon={<img src="/assets/icons/key.svg" className="w-6 h-6 dark:invert" alt="User" />}
          label="API Key"
          subtitle="Generate api key here"
          onClick={() => setSelectedAiMenu("api-key")}
          selected={selectedAiMenu === "api-key"}
        />
      </div>
    </div>
  );
}
