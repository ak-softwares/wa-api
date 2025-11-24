'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/hooks/contact/useContacts";
import ContactAvatar from "./ContactAvatar";
import { useState, useRef } from "react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import ContactMenu from "./ContactMenu";
import ContactsMenu from "./ContactsMenu";
import IconButton from "@/components/common/IconButton";
import SearchBar from "@/components/common/SearchBar";
import SelectedContactsMenu from "./SelectedContactsMenu";
import { useDeleteContacts } from "@/hooks/contact/useDeleteContacts";
import { useBroadcast } from "@/hooks/chat/useBroadcast";
import { Contact } from "@/types/Contact";
import { useAddContact } from "@/hooks/contact/useAddContact";
import { useEditContact } from "@/hooks/contact/useEditContact";

export default function ContactList() {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const { contacts, setContacts, loading, loadingMore, hasMore, refreshContacts, searchContacts, totalContacts } = useContacts({ sidebarRef });
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { openBroadcastDialog, BroadcastDialog } = useBroadcast();
  const router = useRouter();
  const { deleteContactsBulk } = useDeleteContacts();
  const { openAddContactDialog, AddContactDialog } = useAddContact();
  const { openEditContactDialog, EditContactDialog } = useEditContact();


  const handleEditContact = (contact: Contact) => {
    openEditContactDialog(contact);
  };

  const handleMakeBroadcast = async () => {
    openBroadcastDialog(selectedContacts)
  }

  const handleDeleteSelected = async () => {
    if (!selectedContacts || selectedContacts.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    const success = await deleteContactsBulk(selectedContacts.map(contact => contact._id!.toString()));
    if (success) {
      // ✅ Remove deleted contacts from UI
      setContacts((prev) =>
        prev.filter((c) => !selectedContacts.some((sc) => sc._id === c._id))
      );
      clearSelection?.(); // ✅ Optionally clear selection state
    }
  };

  const handleDelete = (deletedId: string) => {
    setContacts((prev) => prev.filter((c) => c._id!.toString() !== deletedId));
    // refreshContacts();
  };

  // Toggle contact selection
  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev =>
      prev.some(c => c._id === contact._id)
        ? prev.filter(c => c._id !== contact._id)
        : [...prev, contact]
    );
  };

  // Select all contacts
  const selectAllContacts = () => {
    setSelectedContacts(contacts); // whole objects
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedContacts([]);
    setIsSelectionMode(false);
  };

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

  const goToContact = (id: string) => {
    router.push(`/dashboard/contacts/${id}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts <span className="text-gray-500 text-sm">({totalContacts})</span></h1>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={openAddContactDialog}
            label={"Add Contact"}
            IconSrc={"/assets/icons/add-contacts.svg"}
          />
          <ContactsMenu onSelectContacts={() => setIsSelectionMode(true)} />
          {AddContactDialog}
        </div>
      </div>

      {/* Selection Mode */}
      {isSelectionMode && (
        <div>
          <div className="px-4 py-2 mb-2 flex items-center justify-between bg-gray-100 dark:bg-[#1E1F1F] border-b border-t border-gray-300 dark:border-[#333434]">
            <div className="flex items-center gap-3">
              <IconButton
                onClick={clearSelection}
                label={"Close Selection"}
                IconSrc={"/assets/icons/close.svg"}
              />
              <h2 className="text-lg">{selectedContacts.length} selected</h2>
            </div>
            <SelectedContactsMenu 
              onDeleteSelected={handleDeleteSelected}
              onMakeBroadcast={handleMakeBroadcast} 
              onSelectAll={selectAllContacts} 
            />
            
            {/* The dialog renders here */}
            {BroadcastDialog}
          </div>
        </div>
      )}


      {/* Search Bar */}
      <SearchBar
          placeholder="Search contacts..."
          onSearch={searchContacts}
      />

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
        ) : (
          contacts.map((contact) => {
            const isSelected = selectedContacts.some(c => c._id === contact._id);
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
                  isSelectionMode={isSelectionMode}
                  isSelected={isSelected}
                  onClick={() =>
                    isSelectionMode
                      ? toggleContactSelection(contact)
                      : null
                  }
                  rightMenu={
                    <ContactMenu 
                      contact={contact} 
                      onDelete={handleDelete}
                      onEdit={() => handleEditContact(contact)}
                    />}
                />
              </div>
            );
          })
        )}

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
      {EditContactDialog}
    </div>
  );
}