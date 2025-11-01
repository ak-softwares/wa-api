import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateContactDialog from "./UpdateContact";
import DeleteContactDialog from "./DeleteConstact";
import ChatTab from "./ChatWithContact";
import { useContacts } from "@/hooks/contact/useContacts";
import { User, Phone, Search, Users, Check, MessageCircle, MoreVertical } from "lucide-react";
import ContactAvatar from "./ContactAvatar";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/common/useDebounce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import ContactMenu from "./ContactMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import ContactsMenu from "./ContactsMenu";

interface SelectedContact {
  number: string;
}

export default function ContactList() {
  const { contacts, loading, loadingMore, hasMore, refreshContacts, searchContacts, totalContacts } = useContacts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false); 
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [broadcastName, setBroadcastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const router = useRouter();

  const selectedContacts: SelectedContact[] = contacts
    .filter(contact => selectedContactIds.includes(contact._id!.toString()))
    .map(contact => ({
      number: contact.phones[0] // Using first phone number
    }));

  const handleSearch = useCallback(async (term: string) => { 
    if (term.trim()) { 
      setIsSearching(true); 
      await searchContacts(term);
      setIsSearching(false); 
    } else { 
      refreshContacts(); 
    } 
  }, []);
  
  useEffect(() => { 
    handleSearch(debouncedSearchTerm); 
  }, [debouncedSearchTerm, handleSearch]);

  const handleClearSearch = () => {
    setSearchTerm("");
    refreshContacts(); 
  };

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

  return (
    <div className="bg-white dark:bg-[#161717] min-h-screen flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contacts <span className="text-gray-500 text-sm">({totalContacts})</span></h1>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white dark:hover:bg-[#252727] hover:bg-gray-200">
            <img src="/assets/icons/add-contacts.svg" className="w-6 h-6 dark:invert" alt="add contact" />
          </div>
          <ContactsMenu />
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="px-5">
        <div className="relative z-10">
          <Search className="absolute left-3 top-2.5 h-4 w-6 text-gray-500" size={22} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              p-1.5
              pl-12 rounded-full
              bg-gray-200 dark:bg-[#2E2F2F]
              border border-transparent
              focus:border-2 focus:border-white
              focus:outline-none
              placeholder:text-base placeholder:text-gray-400
              dark:text-white
              w-full
            "
          />
          {searchTerm && (
            <Button
              variant="ghost"
              onClick={handleClearSearch}
              className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 hover:bg-transparent"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto mt-3">
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
                // onClick={() => handleOpenChat(contact)}
                className={"mx-3 mb-1 rounded-lg group flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2E2F2F] transition-colors"}
              >
                {/* Avatar */}
                <ContactAvatar
                  imageUrl={contact.imageUrl}
                  title={contact.name || formatPhone(String(contact.phones[0])) || "Unknown"}
                  subtitle={formatAndJoinPhones(contact.phones)}
                  size="xl"
                />

                {/* Right Side */}
                <div className="flex-1 flex flex-col items-end">
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-5 h-5" />
                    {/* Simple circle with unread count */}
                    <ContactMenu contact={contact} />
                  </div>
                </div>
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