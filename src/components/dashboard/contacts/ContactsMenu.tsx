"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash, MessageCircle, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteContacts } from "@/hooks/contact/useDeleteContacts";
import { IContact } from "@/types/Contact";

export default function ContactsMenu() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);


  const handlePhoneSelect = (phone: string) => {
    setIsDialogOpen(false);
    router.push(`/dashboard/chats?phone=${phone}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white dark:hover:bg-[#252727] hover:bg-gray-200 cursor-pointer"
          >
            <img
              src={"/assets/icons/more-vertical.svg"}
              className="w-6 h-6 dark:invert"
              alt={"more options"}
            />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="dark:bg-[#161717]"
        >
          {/* Chat Item */}
          <DropdownMenuItem
            className="flex items-center gap-2 hover:dark:bg-[#343636]"
          >
            <img
              src={"/assets/icons/broadcast.svg"}
              className="w-6 h-6 dark:invert"
              alt={"more options"}
            />
            Broadcast List
          </DropdownMenuItem>

          {/* Edit Placeholder */}
          <DropdownMenuItem className="hover:dark:bg-[#343636] flex items-center gap-2">
            <img
              src={"/assets/icons/select.svg"}
              className="w-6 h-6 dark:invert"
              alt={"more options"}
            />            Select Contacts
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
