"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import IconButton from "@/components/common/IconButton";

interface ContactsMenuProps {
  onSelectAll?: () => void; // ✅ Prop for parent callback
  onDeleteSelected?: () => void; // ✅ Prop for parent callback
}

export default function SelectedChatMenu({ onSelectAll, onDeleteSelected }: ContactsMenuProps) {

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            asChild
            label="Contact Menu"
            IconSrc="/assets/icons/more-vertical.svg"
            tooltipSide="bottom"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="dark:bg-[#161717]"
        >
          {/* Chat Item */}
          <DropdownMenuItem
            className="flex items-center gap-2 hover:dark:bg-[#343636]"
            onClick={() => onSelectAll?.()}
          >
            <img
              src={"/assets/icons/select.svg"}
              className="w-6 h-6 dark:invert"
              alt={"more options"}
            />
            Select All
          </DropdownMenuItem>

          {/* Edit Placeholder */}
          <DropdownMenuItem
            className="hover:dark:bg-[#343636] flex items-center gap-2"
            onClick={() => onDeleteSelected?.()}
          >
            <img
              src={"/assets/icons/delete.svg"}
              className="w-6 h-6 dark:invert"
              alt={"Delete Selected"}
            />
            Delete Selected
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
