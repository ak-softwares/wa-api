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


interface SelectedContact {
  number: string;
}

export default function ContactList() {
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const { contacts, setContacts, loading, loadingMore, hasMore, refreshContacts, searchContacts, totalContacts } = useContacts({ sidebarRef });
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastName, setBroadcastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { deleteContact, deleteContactsBulk, deleting } = useDeleteContacts();

  const handleDeleteSelected = async () => {
    if (!selectedContactIds || selectedContactIds.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    const success = await deleteContactsBulk(selectedContactIds);
    if (success) {
      // ✅ Remove deleted contacts from UI
      setContacts((prev) =>
        prev.filter((c) => !selectedContactIds.includes(c._id!.toString()))
      );
      clearSelection?.(); // ✅ Optionally clear selection state
    }
  };

  const handleDelete = (deletedId: string) => {
    setContacts((prev) => prev.filter((c) => c._id!.toString() !== deletedId));
    // refreshContacts();
  };

  const selectedContacts: SelectedContact[] = contacts
    .filter(contact => selectedContactIds.includes(contact._id!.toString()))
    .map(contact => ({
      number: contact.phones[0] // Using first phone number
    }));


  // Toggle contact selection
  const toggleContactSelection = (contactId: string) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Select all contacts
  const selectAllContacts = () => {
    setSelectedContactIds(contacts.map(contact => contact._id!.toString()));
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedContactIds([]);
    setIsSelectionMode(false);
  };

  // Start broadcast selection
  const startBroadcastSelection = () => {
    setIsSelectionMode(true);
  };

  // Open broadcast dialog
  const openBroadcastDialog = () => {
    if (selectedContactIds.length === 0) {
      toast.error("Please select at least one contact!");
      return;
    }
    setIsBroadcastDialogOpen(true);
  };

  const formatPhone = ( number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  }

  // Create broadcast
  const createBroadcast = async () => {
    if (!selectedContacts || selectedContacts.length === 0) {
      toast.error("Please select at least one contact!");
      return;
    }

    if (!broadcastName.trim()) {
      toast.error("Please enter a broadcast name!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/whatsapp/chats/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          chatName: broadcastName.trim(), 
          participants: selectedContacts 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create broadcast chat");
      }

      toast.success("Broadcast chat created successfully");
      setIsBroadcastDialogOpen(false);
      setBroadcastName("");
      clearSelection();
      router.push("/dashboard/messages");
    } catch (err: any) {
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle individual contact deletion in selection mode
  const handleContactDeleted = (contactId: string) => {
    refreshContacts();
    // Remove from selected contacts if it was selected
    setSelectedContactIds(prev => prev.filter(id => id !== contactId));
  };

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

  // In your navigation
  const goToNewContact = () => {
    router.push('/dashboard/contacts/new');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts <span className="text-gray-500 text-sm">({totalContacts})</span></h1>
        <div className="flex items-center gap-2">
          <IconButton
            onClick={goToNewContact}
            label={"Add Contact"}
            IconSrc={"/assets/icons/add-contacts.svg"}
          />
          <ContactsMenu onSelectContacts={() => setIsSelectionMode(true)} />
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
              <h2 className="text-lg">{selectedContactIds.length} selected</h2>
            </div>
            <SelectedContactsMenu 
              onDeleteSelected={handleDeleteSelected}
              // onMakeBroadcast={handleMakeBroadcast} 
              onSelectAll={selectAllContacts} 
            />
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
            const isSelected = selectedContactIds.includes(contact._id!.toString());
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
                      ? toggleContactSelection(contact._id!.toString())
                      : goToContact(contact._id!.toString())
                  }
                  rightMenu={<ContactMenu contact={contact} onDelete={handleDelete} />}
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

    </div>
  );
}