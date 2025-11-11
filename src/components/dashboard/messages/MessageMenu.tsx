"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import MenuItemsList from "@/components/common/MenuItemList";

interface MenuItem {
  icon: string;
  label: string;
  action?: () => void;
  danger?: boolean;
}

interface MessageMenuProps {
  isMine: boolean;
  items: MenuItem[];
}

export default function MessageMenu({ isMine, items }: MessageMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`p-1 rounded-full ${
            isMine ? "dark:bg-[#144D37]/30" : "dark:bg-[#2E2F2F]/30"
          }`}
        >
          <ChevronDown className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          align={isMine ? "end" : "start"}
          side="bottom"
          sideOffset={6}
          className="
            dark:bg-[#161717]
            bg-white
            rounded-xl
            p-1
            min-w-[150px]
            shadow-xl
            border border-gray-200/20
            z-[9999]
          "
        >
          <MenuItemsList items={items} /> {/* ✅ use reusable list */}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
