'use client';

import { useRef, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ContactAvatar from "../contacts/common/ContactAvatar";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { useContacts } from "@/hooks/contact/useContacts";
import { Contact } from "@/types/Contact";
import { toast } from "@/components/ui/sonner";
import { ChatParticipant } from "@/types/Chat";

interface BlockContactsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (contacts: Contact[]) => Promise<void>; // ⬅️ New block handler
  blockedNumbers: ChatParticipant[];   // ⬅️ NEW
}

export default function BlockContactsPopup({ isOpen, onClose, onBlock, blockedNumbers }: BlockContactsPopupProps) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { contacts, loading, loadingMore, hasMore, refreshContacts, searchContacts } = useContacts({ sidebarRef });

  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      refreshContacts();
    } else {
      setIsSelectionMode(false);
      setSelectedContacts([]);
    }
  }, [isOpen]);

  const formatAndJoinPhones = (phones: string[], defaultCountry: CountryCode = "IN") => {
    return phones.map((num) => {
      try {
        const p = parsePhoneNumberFromString(num, defaultCountry);
        return p ? p.formatInternational() : num;
      } catch {
        return num;
      }
    }).join(", ");
  };

  const formatPhone = (num: string, defaultCountry: CountryCode = "IN") => {
    const p = parsePhoneNumberFromString(num, defaultCountry);
    return p ? p.formatInternational() : num;
  };

  const toggleContactSelection = (contact: Contact) => {
    if (!isSelectionMode) setIsSelectionMode(true);

    setSelectedContacts(prev =>
      prev.some(c => c._id === contact._id)
        ? prev.filter(c => c._id !== contact._id)
        : [...prev, contact]
    );
  };

  const handleBlock = async () => {
    if (!selectedContacts.length) {
      toast.error("Please select at least one contact!");
      return;
    }

    try {
      await onBlock(selectedContacts);          // ⬅️ YOUR BLOCK FUNCTION HERE
      // Reset UI
      setSelectedContacts([]);
      setIsSelectionMode(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to block contacts.");
    }
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
              <h3 className="text-lg font-semibold">Select contacts to block</h3>
            </div>
          </div>
        </div>

        {/* Search */}
        <SearchBar placeholder="Search contacts..." onSearch={searchContacts} />

        <p className="text-gray-500 px-6">List of contacts</p>

        {/* Contact List */}
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
              const isAlreadyBlocked = blockedNumbers.some((p) => p.number === contact.phones[0]);
              const isSelected = selectedContacts.some(c => c._id === contact._id);
              const displayName = contact.name || formatPhone(String(contact.phones[0])) || "Unknown";
              const displayImage = contact.imageUrl;

              return (
                <div key={contact._id!.toString()} className={"mx-3"}>
                  <ContactAvatar
                    imageUrl={displayImage}
                    title={displayName}
                    subtitle={formatAndJoinPhones(contact.phones)}
                    size="xl"
                    isDisabled={isAlreadyBlocked}
                    isSelectionMode={isSelectionMode}
                    isSelected={isAlreadyBlocked ? true : isSelected}
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
              IconSrc={"/assets/icons/block.svg"}
              onClick={handleBlock}
              label="Block"
              className="bg-red-600 text-white"
            >
              Block
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}
