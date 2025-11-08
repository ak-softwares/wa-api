"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import IconButton from "@/components/common/IconButton";
import { useRouter } from "next/navigation";

interface ChatsMenuProps {
  onSelectChats?: () => void; // ✅ Prop for parent callback
}

export default function TemplatesMenu({ onSelectChats }: ChatsMenuProps) {

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            asChild
            label="Chat Menu"
            IconSrc="/assets/icons/more-vertical.svg"
            tooltipSide="bottom"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="dark:bg-[#161717]"
        >
          
          <DropdownMenuItem
            className="hover:dark:bg-[#343636] flex items-center gap-2"
            onClick={() => onSelectChats?.()}
          >
            <img
              src={"/assets/icons/select.svg"}
              className="w-6 h-6 dark:invert"
              alt={"select"}
            />
            Select Templates
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
