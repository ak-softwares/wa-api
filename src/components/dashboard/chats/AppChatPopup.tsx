'use client';

import { useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/hooks/contact/useContacts";
import ContactAvatar from "../contacts/ContactAvatar";
import SearchBar from "@/components/common/SearchBar";
import IconButton from "@/components/common/IconButton";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { Contact } from "@/types/Contact";
import { useChatStore } from "@/store/chatStore";
import { useOpenChat } from "@/hooks/chat/useOpenChat";

interface NewChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewChatPopup({ isOpen, onClose }: NewChatPopupProps) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { contacts, loading, loadingMore, hasMore, refreshContacts, searchContacts } = useContacts({ sidebarRef });
  const { activeChat, setActiveChat } = useChatStore();
  const { openChatByContact } = useOpenChat();
  
  // Auto fetch contacts when popup opens
  useEffect(() => {
    if (isOpen) {
        refreshContacts();
    }
  }, [isOpen]);


  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };

  const formatAndJoinPhones = (phones: string[], defaultCountry: CountryCode = "IN") => {
    return phones
      .map((number) => {
        try {
          const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
          return phoneNumber ? phoneNumber.formatInternational() : number;
        } catch {
          return number;
        }
      })
      .join(", ");
  };

  const handleContactClick = async (contact: Contact) => {
    const phone = contact?.phones?.[0];
    if (!phone) return;
    openChatByContact(phone);
    onClose();
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
              <h2 className="text-lg font-semibold">New Chat</h2>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
            placeholder="Search contacts..."
            onSearch={searchContacts}
        />
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
                return (
                    <div
                        key={contact._id!.toString()}
                        className={"mx-3"}
                    >
                        {/* Avatar */}
                        <ContactAvatar
                            imageUrl={contact.imageUrl}
                            title={contact.name || formatPhone(String(contact.phones[0])) || "Unknown"}
                            subtitle={formatAndJoinPhones(contact.phones)}
                            size="xl"
                            isSelectionMode={false}
                            onClick={() => handleContactClick(contact)}
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
      </div>
    </div>
  );
}