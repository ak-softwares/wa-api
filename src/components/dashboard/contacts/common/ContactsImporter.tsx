"use client";

import { useRef, useState } from "react";
import SearchBar from "@/components/common/SearchBar";
import ContactAvatar from "@/components/dashboard/contacts/common/ContactAvatar";
import IconButtonSend from "@/components/common/IconButtonSend";
import { showToast } from "@/components/ui/sonner";
import { Contact } from "@/types/Contact";
import IconButton from "@/components/common/IconButton";
import GenericMenu from "@/components/common/DropDownMenu";
import { useContacts } from "@/hooks/contact/useContacts";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatParticipant } from "@/types/Chat";

type Props = {
  onBack?: () => void;
  onImportContacts: (contacts: Contact[]) => void;
};

export default function ContactImporter({ onBack, onImportContacts }: Props) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { contacts, loading, loadingMore, hasMore, searchContacts, totalContacts } = useContacts({ sidebarRef });
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Toggle contact selection
  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev =>
      prev.some(c => c._id === contact._id)
        ? prev.filter(c => c._id !== contact._id)
        : [...prev, contact]
    );
  };

  const selectAllContacts = () => { setSelectedContacts(contacts) };

  const clearSelection = () => { setSelectedContacts([]) };

  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  function formatAndJoinPhones(phones: string[], defaultCountry: CountryCode = "IN") {
    return phones
      .map((number) => {
        try {
          const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
          return phoneNumber ? phoneNumber.formatInternational() : number;
        } catch {
          return number; // fallback if parsing fails
        }
      })
      .join(", ");
  }

  const handleImportSelected = () => {
    if (selectedContacts.length === 0) {
      showToast.error("Please select at least one contact");
      return;
    }

    onImportContacts(selectedContacts);
  };

  const filterByTag = (tag: string) => {
    setSearchValue(tag);
  };

  const topItems = [
    { icon: "/assets/icons/select.svg", label: "Select All", action: selectAllContacts },
    { icon: "/assets/icons/close.svg", label: "Clear All", action: clearSelection },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* BODY */}
      <div>
        <div className="px-4 py-2 mb-2 flex items-center justify-between bg-gray-100 dark:bg-[#1E1F1F] border-b border-t border-gray-300 dark:border-[#333434]">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={onBack ? onBack : clearSelection}
              label={"Close Selection"}
              IconSrc={"/assets/icons/close.svg"}
            />
            <h2 className="text-lg">{selectedContacts.length} selected</h2>
          </div>
          <GenericMenu topItems={topItems} />
        </div>
      </div>

      {/* SEARCH */}
      <div className="px-4">
        <SearchBar
          value={searchValue}
          placeholder="Search contacts..."
          onSearch={searchContacts}
        />
      </div>

      {/* Contact List */}
      <div ref={sidebarRef} className="flex-1 overflow-y-auto mt-3">
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
        ) : <div className="pb-6">{ 
            contacts.map((contact) => {
              const isSelected = selectedContacts.some(c => c._id === contact._id);
              // Convert Contact → ChatParticipant shape
              const participant: ChatParticipant = {
                number: contact.phones[0],
                name: contact.name ?? undefined,
                imageUrl: contact.imageUrl ?? undefined,
              };
              return (
                <div
                  key={contact._id!.toString()}
                  className={"mx-3 mb-2"}
                >
                  {/* Avatar */}
                  <ContactAvatar
                    imageUrl={contact.imageUrl}
                    title={contact.name || formatPhone(String(contact.phones[0])) || "Unknown"}
                    subtitle={formatAndJoinPhones(contact.phones)}
                    tags={contact.tags}
                    onTagClick={(tag) => filterByTag(tag)}
                    size="xl"
                    isSelectionMode={true}
                    isSelected={isSelected}
                    onClick={() => toggleContactSelection(contact) }
                  />
                </div>
              );
            })
          } </div>
        }

        {hasMore &&
          loadingMore &&
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

      {/* FOOTER */}
      {selectedContacts.length > 0 && (
        <div className="flex items-center justify-between p-4 border-t dark:border-[#333434]">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {selectedContacts.length} contact
            {selectedContacts.length > 1 ? "s" : ""} selected
          </p>

          <IconButtonSend
            IconSrc={"/assets/icons/send-message.svg"}
            onClick={handleImportSelected}
            label={"Import"}
            className="bg-[#21C063] !hove:bg-[#21C063] text-white"
          >
            Import
          </IconButtonSend>
        </div>
      )}
    </div>
  );
}
