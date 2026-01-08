"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ContactAvatar from "@/components/dashboard/contacts/ContactAvatar";
import IconButton from "@/components/common/IconButton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import Image from "next/image";
import { Contact } from "@/types/Contact";
import { useChatStore } from "@/store/chatStore";

export const useBroadcast = (onSuccess?: () => void) => {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [broadcastName, setBroadcastName] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { activeChat, setActiveChat, setNewMessageData } = useChatStore();

  const open = (contacts: any[]) => {
    setSelectedContacts(contacts);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setBroadcastName("");
    setSelectedContacts([]);
  };

  const createBroadcast = async () => {
    if (!broadcastName.trim()) {
      toast.error("Please enter a broadcast name!");
      return;
    }

    if (!selectedContacts.length) {
      toast.error("Please select at least one contact!");
      return;
    }

    setIsLoading(true);

    try {
      // 🔥 Convert contacts → chatParticipants
      const chatParticipants = selectedContacts.map((c: Contact) => ({
        name: c.name || null,
        number: c.phones?.[0] || "",   // pick first phone
        imageUrl: c.imageUrl || null,
      }));

      const response = await fetch("/api/wa-accounts/chats/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatName: broadcastName.trim(),
          participants: chatParticipants,
        }),
      });

      const data = await response.json();
      const chat = data.data;
      if (!response.ok) {
        throw new Error(data?.message || "Failed to create broadcast chat");
      }
      // notify parent (MakeBroadcastPopup)
      if (onSuccess) onSuccess();
      // ⭐️ Set active chat
      setNewMessageData(null, chat);
      setActiveChat(chat);
      toast.success("Broadcast list created");
      close();
      router.push("/dashboard/chats");
    } catch (err: any) {
      toast.error(err.message || "Broadcast creation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };

  const handleRemoveContact = (contactId: string) => {
    setSelectedContacts(prev => prev.filter(c => c._id!.toString() !== contactId));
  };

  // ----------------------------------------------------
  // 🔥 The Broadcast Dialog (UI inside hook)
  // ----------------------------------------------------
  const BroadcastDialog = useMemo(() =>  {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">

            {/* Header */}
            <div className="mb-4 dark:border-[#333434]">
                <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <IconButton
                        onClick={close}
                        label="Back"
                        IconSrc="/assets/icons/close.svg"
                    />
                    <h3 className="text-lg font-semibold">Create Broadcast</h3>
                </div>
                </div>
            </div>

          <div className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Broadcast Name
              </label>
              <Input
                value={broadcastName}
                onChange={(e) => setBroadcastName(e.target.value)}
                placeholder="Enter broadcast name"
                className="w-full"
              />
            </div>

            {/* Participants */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Participants ({selectedContacts.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {selectedContacts.map((contact) => {
                    const displayName = contact.name || formatPhone(String(contact.phones[0])) || "Unknown";
                    const displayImage = contact.imageUrl;
                    return (                  
                        <div key={contact._id?.toString()} className="pr-2">
                            <ContactAvatar
                                title={displayName}
                                subtitle={contact.phones?.join(", ")}
                                size="sm"
                                imageUrl={displayImage}
                                rightMenu={
                                    <button
                                    onClick={() => handleRemoveContact(contact._id!.toString())}
                                    className="p-2 hover:opacity-80 transition"
                                    >
                                    <Image
                                        src="/assets/icons/close.svg"
                                        alt="Clear"
                                        width={18}
                                        height={18}
                                        className="dark:invert"
                                    />
                                    </button>
                                }
                            />
                        </div>
                  )}
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={close}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!broadcastName.trim() || isLoading}
                onClick={createBroadcast}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  "Create Broadcast"
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    );
  }, [isOpen, broadcastName, selectedContacts, isLoading]);

  return {
    openBroadcastDialog: open,
    closeBroadcastDialog: close,
    BroadcastDialog,
    isLoading,
  };
};
