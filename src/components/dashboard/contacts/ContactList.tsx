'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/hooks/contact/useContacts";
import ContactAvatar from "./ContactAvatar";
import { useState, useRef } from "react";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { toast } from "@/components/ui/sonner";
import ContactMenu from "./ContactMenu";
import ContactsMenu from "./ContactsMenu";
import IconButton from "@/components/common/IconButton";
import SearchBar from "@/components/common/SearchBar";
import SelectedContactsMenu from "./SelectedContactsMenu";
import { useBroadcast } from "@/hooks/chat/useBroadcast";
import { Contact } from "@/types/Contact";
import { useContactDialog } from "@/hooks/contact/useContactDialog";
import { useBlockedContacts } from "@/hooks/chat/useBlockedContacts";
import { ChatParticipant } from "@/types/Chat";
import { useExportContacts } from "@/hooks/contact/useExportContacts";
import { useDeleteContacts } from "@/hooks/contact/useDeleteContacts";
import { ConfirmDialog } from "@/components/common/dialog/ConfirmDialog";
import { DeleteMode } from "@/utiles/enums/deleteMode";

export default function ContactList() {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const { contacts, setContacts, loading, loadingMore, hasMore, refreshContacts, searchContacts, totalContacts } = useContacts({ sidebarRef });
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { openBroadcastDialog, BroadcastDialog } = useBroadcast();
  const { openAddContactDialog, openEditContactDialog, ContactDialog } = useContactDialog();
  const { isBlocked, toggleBlock, confirmBlockDialog } = useBlockedContacts();
  const { exportContacts } = useExportContacts();
  const [searchValue, setSearchValue] = useState("");

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode | null>(null);
  const [targetContact, setTargetContact] = useState<Contact | null>(null);
  const { deleteContact, deleteContactsBulk, deleteAllContacts, isDeleting } = 
  useDeleteContacts(({ mode, deletedIds }) => {
    setDeleteMode(null);
    setTargetContact(null);

    if (mode === DeleteMode.All) {
      setContacts([]);
      return;
    }

    if (mode === DeleteMode.Bulk) {
      setSelectedContacts([]);
    }
    
    setContacts((prev) =>
      prev.filter((c) => !deletedIds.includes(c._id!.toString()))
    );
    setOpenDeleteDialog(false); // close dialog after success

  });

  const handleDeleteContact = (deletedContact: Contact) => {
    setTargetContact(deletedContact);
    setDeleteMode(DeleteMode.Single);
    setOpenDeleteDialog(true);
  };
  
  const handleDeleteSelected = () => {
    if (!selectedContacts || selectedContacts.length === 0) {
      toast.error("No contacts selected");
      return;
    }

    setDeleteMode(DeleteMode.Bulk);
    setOpenDeleteDialog(true);
  };

  const handleDeleteAllContacts = () => {
    setDeleteMode(DeleteMode.All);
    setOpenDeleteDialog(true);
  };

  const handleExport = () => {
    exportContacts(selectedContacts);
  };

  const handleMakeBroadcast = async () => {
    openBroadcastDialog(selectedContacts)
  }

  // Toggle contact selection
  const toggleContactSelection = (contact: Contact) => {
    setSelectedContacts(prev =>
      prev.some(c => c._id === contact._id)
        ? prev.filter(c => c._id !== contact._id)
        : [...prev, contact]
    );
  };

  // Select all contacts
  const selectAllContacts = () => {setSelectedContacts(contacts)};

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

  const filterByTag = (tag: string) => {
    setSearchValue(tag);
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
          <ContactsMenu onSelectContacts={() => setIsSelectionMode(true)} onDeleteAllContacts={handleDeleteAllContacts} />
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
              onExportContacts={handleExport}
            />
            
            {/* The dialog renders here */}
            {BroadcastDialog}
          </div>
        </div>
      )}


      {/* Search Bar */}
      <SearchBar
        value={searchValue}
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
            // Convert Contact → ChatParticipant shape
            const participant: ChatParticipant = {
              number: contact.phones[0],
              name: contact.name ?? undefined,
              imageUrl: contact.imageUrl ?? undefined,
            };
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
                  tags={contact.tags}
                  onTagClick={(tag) => filterByTag(tag)}
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
                      onDelete={handleDeleteContact}
                      onEdit={() => openEditContactDialog(contact)}
                      onBlockToggle={() => toggleBlock(participant)}
                      isBlocked={isBlocked(participant)}
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
      {ContactDialog}
      {confirmBlockDialog()}
      <ConfirmDialog
        open={openDeleteDialog}
        loading={isDeleting}
        title={
          deleteMode === DeleteMode.Single
            ? "Delete contact?"
            : deleteMode === DeleteMode.Bulk
            ? "Delete selected contacts?"
            : "Delete all contacts?"
        }
        description="This action cannot be undone."
        onCancel={() => setOpenDeleteDialog(false)}
        onConfirm={async () => {
          if (deleteMode === DeleteMode.Single && targetContact) {
            await deleteContact(targetContact._id!, targetContact.name);
          }

          if (deleteMode === DeleteMode.Bulk) {
            const ids = selectedContacts.map((c) => c._id!.toString());
            await deleteContactsBulk(ids);
          }

          if (deleteMode === DeleteMode.All) {
            await deleteAllContacts();
          }
        }}
      />
    </div>
  );
}