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

interface ContactMenuProps {
  contact: IContact;
  onDelete?: (contactId: string) => void;
}

export default function ContactMenu({ contact, onDelete }: ContactMenuProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { deleteContact, deleting } = useDeleteContacts(() => {
    onDelete?.(contact._id!.toString());
  });

  const handleChatClick = () => {
    if (contact.phones.length === 1) {
      // Direct navigation if only one phone
      router.push(`/dashboard/chats?phone=${contact.phones[0]}`);
    } else {
      // Open dialog for multiple phones
      setIsDialogOpen(true);
    }
  };

  const handlePhoneSelect = (phone: string) => {
    setIsDialogOpen(false);
    router.push(`/dashboard/chats?phone=${phone}`);
  };

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
          {/* Chat Item */}
          <DropdownMenuItem
            onClick={handleChatClick}
            className="flex items-center gap-2 hover:dark:bg-[#343636]"
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </DropdownMenuItem>

          {/* Edit Placeholder */}
          <DropdownMenuItem className="hover:dark:bg-[#343636] flex items-center gap-2">
            <Trash className="w-4 h-4" />
            Edit
          </DropdownMenuItem>

          {/* Delete Item */}
          <DropdownMenuItem
            onClick={() => deleteContact(contact._id!.toString(), contact.name)}
            disabled={deleting}
            className="text-red-600 dark:text-red-400 hover:text-red-600 hover:dark:bg-[#343636] flex items-center gap-2"
          >
            <Trash className="w-4 h-4" />
            {deleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
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
                onClick={() => handlePhoneSelect(phone)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">{phone}</span>
                </div>
                <Button variant="ghost" size="sm">
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
