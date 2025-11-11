"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import IconButton from "@/components/common/IconButton";
import MenuItemsList from "./MenuItemList";

interface MenuItem {
  icon: string;
  label: string;
  action?: () => void;
  danger?: boolean;
}

interface GenericMenuProps {
  topItems: MenuItem[];
  bottomItems?: MenuItem[];
}

export default function GenericMenu({ topItems, bottomItems = [] }: GenericMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          asChild
          label="More Options"
          IconSrc="/assets/icons/more-vertical.svg"
          tooltipSide="bottom"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
        className="dark:bg-[#161717] min-w-[220px] rounded-xl p-2"
      >
        {/* 🔹 Top Section */}
        <MenuItemsList items={topItems} />

        {/* 🔸 Separator */}
        {bottomItems.length > 0 && <DropdownMenuSeparator className="dark:bg-[#2A2A2A] my-1" />}

        {/* 🔻 Bottom Section */}
        <MenuItemsList items={bottomItems} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
