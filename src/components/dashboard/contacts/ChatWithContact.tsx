"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { IContact } from "@/types/Contact";

interface ChatTabProps {
  contact: IContact;
}

export default function ChatTab({ contact }: ChatTabProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleChatClick = () => {
    if (contact.phones.length === 1) {
      // Directly navigate to chat if only one phone number
      router.push(`/dashboard/chats?phone=${contact.phones[0]}`);
    } else {
      // Open dialog to select phone number if multiple
      setIsDialogOpen(true);
    }
  };

  const handlePhoneSelect = (phone: string) => {
    setIsDialogOpen(false);
    router.push(`/dashboard/chats?phone=${phone}`);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleChatClick}
        className="flex items-center gap-2"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>

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