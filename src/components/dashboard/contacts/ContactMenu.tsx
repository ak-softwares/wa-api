"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/Contact";
import { useOpenChat } from "@/hooks/chat/useOpenChat";
import MenuItemsList from "@/components/common/MenuItemList";

interface ContactMenuProps {
  contact: Contact;
  onDelete?: (contact: Contact) => void;
  onEdit?: () => void;
  onBlockToggle?: () => void;
  isBlocked?: boolean;
}

export default function ContactMenu({ contact, onDelete, onEdit, onBlockToggle, isBlocked }: ContactMenuProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openChatByContact } = useOpenChat();

  const handleChatClick = () => {
    if (contact.phones.length === 1) {
      const phone = contact?.phones?.[0];
      if (!phone) return;
      openChatByContact(phone);
      router.push("/dashboard/chats");
    } else {
      // Open dialog for multiple phones
      setIsDialogOpen(true);
    }
  };

  const handlePhoneSelect = (phone: string) => {
    if (!phone) return;
    openChatByContact(phone);
    setIsDialogOpen(false);
    router.push("/dashboard/chats");
  };

  // ⭐ Dynamic Block / Unblock item (same logic as ChatMenu)
  const blockItem = 
  isBlocked
    ? {
        icon: "/assets/icons/block.svg",
        label: "Unblock",
        danger: false,
        action: () => onBlockToggle?.(),
      }
    : {
        icon: "/assets/icons/block.svg",
        label: "Block",
        danger: true,
        action: () => onBlockToggle?.(),
      };

  const topItems = [
    { icon: "/assets/icons/chat-add.svg", label: "Chat", action: handleChatClick },
    { icon: "/assets/icons/edit.svg", label: "Edit", action: onEdit }
  ];


  const bottomItems = [
    blockItem,
    { icon: "/assets/icons/delete.svg", label: "Delete contact", action: () => onDelete?.(contact), danger: true },
  ];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span
            onClick={(e) => e.stopPropagation()}
            className="rounded-full cursor-pointer flex items-center justify-center"
          >
            <span className="h-6 flex items-center justify-center">
              <ChevronDown
                className="hidden group-hover:flex h-6 w-6 text-gray-400"
                strokeWidth={2}
              />
            </span>
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          onClick={(e) => e.stopPropagation()}
          className="dark:bg-[#161717]"
        >
        {/* 🔹 Top Section */}
        <MenuItemsList items={topItems} />

        {/* 🔸 Separator */}
        {bottomItems.length > 0 && <DropdownMenuSeparator className="dark:bg-[#2A2A2A] my-1" />}

        {/* 🔻 Bottom Section */}
        <MenuItemsList items={bottomItems} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Phone Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Phone Number</DialogTitle>
            <p className="text-sm text-gray-500">
              Choose which phone number to chat with {contact.name}
            </p>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {contact.phones.map((phone, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();  // important
                handlePhoneSelect(phone);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">{phone}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();  // important
                  handlePhoneSelect(phone);
                }}
              >
                Chat
              </Button>
            </div>

            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
