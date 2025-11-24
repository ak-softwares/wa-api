'use client';

import { useRef, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ContactAvatar from "../contacts/ContactAvatar";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { useContacts } from "@/hooks/contact/useContacts";
import { Contact } from "@/types/Contact";
import { toast } from "@/components/ui/sonner";
import { useEditMembers } from "@/hooks/chat/useEditMembers";
import { ChatParticipant } from "@/types/Chat";
import { useChatStore } from "@/store/chatStore";

interface AddContactsToBroadcastPopupProps {
  isOpen: boolean;
  onClose: () => void;
  existingMembers: string[]; // phone numbers already part of broadcast
}

export default function AddContactsToBroadcastPopup({
  isOpen,
  onClose,
  existingMembers,
}: AddContactsToBroadcastPopupProps) {

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { contacts, refreshContacts, searchContacts, loading, loadingMore, hasMore } =
    useContacts({ sidebarRef });

  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { loading: memberLoading, addMembers, removeMembers } = useEditMembers();
  const { activeChat } = useChatStore();
  
  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };

  useEffect(() => {
    if (isOpen) {
      refreshContacts();
    } else {
      setSelectedContacts([]);
      setIsSelectionMode(false);
    }
  }, [isOpen]);

  const toggleContactSelection = (contact: Contact) => {
    if (!isSelectionMode) setIsSelectionMode(true);

    setSelectedContacts((prev) => {
      const exists = prev.some((c) => c._id === contact._id);
      return exists ? prev.filter((c) => c._id !== contact._id) : [...prev, contact];
    });
  };

  const handleAdd = async () => {
    if (!selectedContacts.length) {
      toast.error("Please select at least one contact!");
      return;
    }

    // Convert selected contacts → ChatParticipants
    const members: ChatParticipant[] = selectedContacts.map((c) => ({
      number: c.phones?.[0] || "",
      name: c.name,
      imageUrl: c.imageUrl
    }));

    try {
      await addMembers(activeChat?._id!.toString() ?? "", members); // <-- API call here

      // Reset state + close popup
      setSelectedContacts([]);
      setIsSelectionMode(false);
      onClose();
    } catch (err) {
      toast.error("Failed to add contacts");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#161717] rounded-lg w-full max-w-md max-h-[80vh] min-h-[60vh] flex flex-col">

        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={onClose}
              label="Back"
              IconSrc="/assets/icons/close.svg"
            />
            <h3 className="text-lg font-semibold">
              Add contacts to broadcast
            </h3>
          </div>
        </div>

        {/* Search */}
        <SearchBar placeholder="Search contacts..." onSearch={searchContacts} />

        {/* Contact List */}
        <p className="text-gray-500 px-6 mt-2">Contacts (excluding existing)</p>

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
            <div className="p-8 text-center">No contacts available.</div>
          ) : (
            contacts.map((contact) => {
              const isSelected = selectedContacts.some((c) => c._id === contact._id);
              const isDisabled = existingMembers.includes(contact.phones?.[0]); // ✅ one line
              const displayName = contact.name || formatPhone(contact.phones[0] || "");
              const displayImage = contact.imageUrl;

              return (
                <div key={contact._id?.toString()} className="mx-3">
                  <ContactAvatar
                    imageUrl={displayImage}
                    title={displayName}
                    subtitle={isDisabled ? "Already added to broadcast" : contact.phones.join(", ")}
                    size="xl"
                    isSelectionMode={isSelectionMode}
                    isSelected={isDisabled ? true : isSelected}
                    isDisabled={isDisabled}
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
              {selectedContacts.length} selected
            </p>

            {memberLoading ? (
              // 🔵 SHOW THIS WHILE LOADING
              <button
                disabled
                className="px-4 py-2 rounded-md bg-[#21C063] text-white opacity-70 cursor-not-allowed"
              >
                Adding...
              </button>
            ) : (
              // 🟢 SHOW NORMAL ICON BUTTON
              <IconButton
                IconSrc="/assets/icons/checkmark-medium.svg"
                onClick={handleAdd}
                label="Add"
                className="bg-[#21C063] text-white"
              />
            )}

          </div>
        )}

      </div>
    </div>
  );
}
