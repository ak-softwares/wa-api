import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateContactDialog from "./UpdateContact";
import DeleteContactDialog from "./DeleteConstact";
import ChatTab from "./ChatWithContact";
import { useContacts } from "@/hooks/contact/useContacts";
import { User, Phone, Search, Users, Check, MessageCircle } from "lucide-react";
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
    .filter(contact => selectedContactIds.includes(contact._id))
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
    setSelectedContactIds(contacts.map(contact => contact._id));
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
    <div className="space-y-3">
      {/* Broadcast Dialog */}
      <Dialog open={isBroadcastDialogOpen} onOpenChange={setIsBroadcastDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Broadcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="broadcastName">Broadcast Name</Label>
              <Input
                id="broadcastName"
                placeholder="Enter broadcast name"
                value={broadcastName}
                onChange={(e) => setBroadcastName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Selected Contacts</Label>
              <div className="mt-1 p-3 border rounded-md max-h-32 overflow-y-auto">
                {selectedContacts.map((contact, index) => (
                  <div key={index} className="text-sm text-gray-600 py-1">
                    {contact.number}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBroadcastDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={createBroadcast}
              disabled={isLoading || !broadcastName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Creating..." : "Create Broadcast"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Selection Mode
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedContactIds.length > 0 && (
                <>
                  <Button
                    onClick={openBroadcastDialog}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Create Broadcast ({selectedContactIds.length})
                  </Button>
                  
                  <Button
                    onClick={selectAllContacts}
                    variant="outline"
                    size="sm"
                  >
                    Select All
                  </Button>
                </>
              )}
              
              <Button
                onClick={clearSelection}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Total Contacts and Broadcast Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>Contacts</span>
          <Badge variant="secondary">{totalContacts}</Badge>
        </div>

        {!isSelectionMode && contacts.length > 0 && (
          <Button
            onClick={startBroadcastSelection}
            variant="outline"
            size="sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Create Broadcast
          </Button>
        )}
      </div>

      {/* 🔍 Search Bar */} 
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search contacts by name or phone..." 
            className="pl-10" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          {searchTerm && ( 
            <Button 
              variant={"ghost"}
              onClick={handleClearSearch} 
              className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 hover:bg-transparent" 
            > 
              ✕ 
            </Button> 
          )}
        </div> 
      </Card>
      
      {/* 🔎 Search Status */}
      {searchTerm && ( 
        <Card className="p-3 mt-2"> 
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600"> 
              {isSearching ? "Searching..." : `Search results for "${searchTerm}"`}
            </span> 
            <button onClick={handleClearSearch} className="text-blue-600 hover:text-blue-800 text-sm">
              Clear search
            </button>
          </div>
        </Card> 
      )}

      {/* 📋 List Header (desktop only) */}
      <Card className="p-4 hidden md:block mt-4">
        <div className="grid grid-cols-12 gap-4 font-semibold">
          {isSelectionMode && (
            <div className="col-span-1 flex items-center justify-center">
              <Checkbox 
                checked={selectedContactIds.length === contacts.length && contacts.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    selectAllContacts();
                  } else {
                    setSelectedContactIds([]);
                  }
                }}
              />
            </div>
          )}
          <div className={`flex items-center ${isSelectionMode ? 'col-span-4' : 'col-span-5'}`}>
            <User className="w-4 h-4 mr-2" /> Name 
          </div>
          <div className="col-span-4 flex items-center">
            <Phone className="w-4 h-4 mr-2" /> Phone 
          </div>
          <div className={`text-center ${isSelectionMode ? 'col-span-3' : 'col-span-3'}`}>
            {isSelectionMode ? 'Selection' : 'Actions'}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {isSelectionMode && (
                  <div className="col-span-12 md:col-span-1 flex justify-center">
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                )}
                <div className={`flex items-center gap-3 ${isSelectionMode ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-5'}`}>
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className={`flex gap-2 ${isSelectionMode ? 'col-span-12 md:col-span-3' : 'col-span-12 md:col-span-3'}`}>
                  {isSelectionMode ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <>
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : contacts.length === 0 ? (
          <Card className="p-8 text-center">
            <p>No contacts yet. Add your first contact!</p>
          </Card>
        ) : (
          <>
            {contacts.map((contact) => (
              <Card
                key={contact._id}
                className={`p-4 transition-colors ${
                  selectedContactIds.includes(contact._id)
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox for selection */}
                  {isSelectionMode && (
                    <div className="col-span-12 md:col-span-1 flex justify-center">
                      <Checkbox
                        checked={selectedContactIds.includes(contact._id)}
                        onCheckedChange={() => toggleContactSelection(contact._id)}
                      />
                    </div>
                  )}

                  {/* Contact Info */}
                  <div className={`${isSelectionMode ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-5'}`}>
                    <ContactAvatar
                      imageUrl={contact.imageUrl}
                      title={contact.name}
                      subtitle={contact.email}
                    />
                  </div>

                  {/* Phone Numbers */}
                  <div className="col-span-12 md:col-span-4">
                    {formatAndJoinPhones(contact.phones)}
                  </div>

                  {/* Actions */}
                  <div className={`flex justify-start md:justify-center gap-2 ${
                    isSelectionMode ? 'col-span-12 md:col-span-3' : 'col-span-12 md:col-span-3'
                  }`}>
                    {isSelectionMode ? (
                      <Badge variant="secondary" className="px-3 py-1">
                        {selectedContactIds.includes(contact._id) ? 'Selected' : 'Not selected'}
                      </Badge>
                    ) : (
                      <>
                        <ChatTab
                          contact={{
                            name: contact.name ?? "",
                            phones: contact.phones,
                          }}
                        />

                        <UpdateContactDialog
                          contact={{
                            id: contact._id,
                            name: contact.name ?? "",
                            phones: contact.phones,
                            email: contact.email,
                          }}
                          onContactUpdated={refreshContacts}
                        />

                        <DeleteContactDialog
                          contactId={contact._id}
                          contactName={contact.name ?? ""}
                          onContactDeleted={() => handleContactDeleted(contact._id)}
                        />
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && loadingMore && (
              <>
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {isSelectionMode && (
                        <div className="col-span-12 md:col-span-1 flex justify-center">
                          <Skeleton className="h-5 w-5 rounded" />
                        </div>
                      )}
                      <div className={`flex items-center gap-3 ${isSelectionMode ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-5'}`}>
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className={`flex gap-2 ${isSelectionMode ? 'col-span-12 md:col-span-3' : 'col-span-12 md:col-span-3'}`}>
                        {isSelectionMode ? (
                          <Skeleton className="h-8 w-20" />
                        ) : (
                          <>
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}