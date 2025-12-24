'use client';

import { useRef, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ContactAvatar from "../contacts/ContactAvatar";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { useContacts } from "@/hooks/contact/useContacts";
import { Contact } from "@/types/Contact";
import { useBroadcast } from "@/hooks/chat/useBroadcast";
import { toast } from "@/components/ui/sonner";

interface MakeBroadcastPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MakeBroadcastPopup({ isOpen, onClose }: MakeBroadcastPopupProps) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { contacts, loading, loadingMore, hasMore, refreshContacts, searchContacts } = useContacts({ sidebarRef });
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  // 🔥 MUST be defined before useBroadcast()
  const handleBroadcastSuccess = () => {
    setSelectedContacts([]);
    setIsSelectionMode(false);
    onClose(); // closes this popup
  };

  const { openBroadcastDialog, closeBroadcastDialog, BroadcastDialog, isLoading: broadcastLoading } = useBroadcast(handleBroadcastSuccess);

  // Auto fetch contacts when popup opens
  useEffect(() => {
    if (isOpen) {
        refreshContacts();
    }else{
      setIsSelectionMode(false);
      setSelectedContacts([]);
    }
  }, [isOpen]);

  function formatAndJoinPhones(phones: string[], defaultCountry: CountryCode = "IN") {
    return phones.map((number) => {
        try {
        const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
        return phoneNumber ? phoneNumber.formatInternational() : number;
        } catch {
        return number; // fallback if parsing fails
        }
    }).join(", ");
  }

  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };

  const toggleContactSelection = (contact: Contact) => {
    // If selection mode is off → enable first
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }

    setSelectedContacts(prev => {
      const exists = prev.some(c => c._id === contact._id);

      return exists
        ? prev.filter(c => c._id !== contact._id) // remove
        : [...prev, contact];                    // add
    });
  };


  const handleMakeBroadcast = async () => {
    if (!selectedContacts.length) {
      toast.error("Please select at least one contact!");
      return;
    }

    // 👉 Open Broadcast Dialog with selected contacts
    openBroadcastDialog(selectedContacts);

    // 3️⃣ Reset selection + close popup after sending
    // setSelectedContacts([]);
    // setIsSelectionMode(false);
    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161717] rounded-lg w-full max-w-md max-h-[80vh] min-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-2 dark:border-[#333434]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IconButton
                onClick={onClose}
                label="Back"
                IconSrc="/assets/icons/close.svg"
              />
              <h3 className="text-lg font-semibold">Select contact for broadcast</h3>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
            placeholder="Search contacts..."
            onSearch={searchContacts}
        />
        {/* Contact List */}
        <p className="text-gray-500 px-6">List of contacts</p>
        <div ref={sidebarRef} className="flex-1 overflow-y-auto my-3">
            {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-4 mx-3 mb-1">
                    <Skeleton className="w-12 h-12 rounded-full mr-3" />
                    <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-5 w-32 rounded" />
                        <Skeleton className="h-4 w-48 rounded" />
                    </div>
                    <Skeleton className="h-4 w-10 ml-2 rounded" />
                    </div>
                ))
            ) : contacts.length === 0 ? (
                    <div className="p-8 text-center">No contacts found.</div>
            ) : (
            contacts.map((contact) => {
              const isSelected = selectedContacts.some(c => c._id === contact._id);
              const displayName = contact.name || formatPhone(String(contact.phones[0])) || "Unknown";
              const displayImage = contact.imageUrl;
                return (
                    <div
                        key={contact._id!.toString()}
                        className={"mx-3"}
                    >
                        {/* Avatar */}
                        <ContactAvatar
                            imageUrl={displayImage}
                            title={displayName || "Unknown"}
                            subtitle={formatAndJoinPhones(contact.phones)}
                            size="xl"
                            isSelectionMode={isSelectionMode}
                            isSelected={isSelected}
                            onClick={() => toggleContactSelection(contact)}
                        />

                    </div>
                );
            })
            )}

            {hasMore && loadingMore &&
            Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 mx-3 mb-1">
                <Skeleton className="w-12 h-12 rounded-full mr-3" />
                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                </div>
                <Skeleton className="h-4 w-10 ml-2 rounded" />
                </div>
            ))}
        </div>

        {/* Footer */}
        {selectedContacts.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t dark:border-[#333434]">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {selectedContacts.length} contact{selectedContacts.length > 1 ? "s" : ""} selected
            </p>

            <IconButton
              IconSrc={"/assets/icons/send-message.svg"}
              onClick={() => handleMakeBroadcast()}
              label={"Send"}
              className="bg-[#21C063] !hove:bg-[#21C063] text-white"
            >
              Send
            </IconButton>
          </div>
        )}
        {BroadcastDialog}
      </div>
    </div>
  );
}