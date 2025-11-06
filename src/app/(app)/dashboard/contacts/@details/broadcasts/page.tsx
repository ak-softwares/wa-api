'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useContacts } from "@/hooks/contact/useContacts";
import ContactAvatar from "@/components/dashboard/contacts/ContactAvatar";
import { toast } from "@/components/ui/sonner";
import IconButton from "@/components/common/IconButton";
import SearchBar from "@/components/common/SearchBar";
import { CheckCircle2, Users2, MessageCircle, ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SelectedContact {
  id: string;
  name: string;
  phones: string[];
  imageUrl?: string;
}

interface Broadcast {
  id: string;
  name: string;
  participants: number;
  lastMessage?: string;
  timestamp: string;
}

export default function BroadcastPage() {
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { contacts, loading, searchContacts, totalContacts } = useContacts({ sidebarRef });
  
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isCreatingBroadcast, setIsCreatingBroadcast] = useState(false);
  const [broadcastName, setBroadcastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'contacts' | 'broadcasts'>('contacts');

  // Mock broadcast data - replace with actual API calls
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([
    {
      id: '1',
      name: 'Team Announcements',
      participants: 15,
      lastMessage: 'Meeting at 3 PM tomorrow',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      name: 'Family Group',
      participants: 8,
      lastMessage: 'Happy birthday!',
      timestamp: '1 day ago'
    }
  ]);

  const selectedContacts: SelectedContact[] = contacts
    .filter(contact => selectedContactIds.includes(contact._id!.toString()))
    .map(contact => ({
      id: contact._id!.toString(),
      name: contact.name || 'Unknown',
      phones: contact.phones,
      imageUrl: contact.imageUrl
    }));

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phones.some(phone => phone.includes(searchTerm))
  );

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

  // Create new broadcast
  const createNewBroadcast = () => {
    if (selectedContactIds.length === 0) {
      toast.error("Please select at least one contact!");
      return;
    }
    setIsCreatingBroadcast(true);
  };

  // Save broadcast
  const saveBroadcast = async () => {
    if (!broadcastName.trim()) {
      toast.error("Please enter a broadcast name!");
      return;
    }

    if (selectedContacts.length === 0) {
      toast.error("Please select at least one contact!");
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBroadcast: Broadcast = {
        id: Date.now().toString(),
        name: broadcastName.trim(),
        participants: selectedContacts.length,
        timestamp: 'Just now'
      };

      setBroadcasts(prev => [newBroadcast, ...prev]);
      toast.success(`Broadcast "${broadcastName}" created successfully!`);
      
      // Reset form
      setBroadcastName("");
      setSelectedContactIds([]);
      setIsCreatingBroadcast(false);
      setIsSelectionMode(false);
      setActiveTab('broadcasts');
    } catch (error) {
      toast.error("Failed to create broadcast");
    } finally {
      setIsLoading(false);
    }
  };

  // Open existing broadcast
  const openBroadcast = (broadcastId: string) => {
    router.push(`/dashboard/messages?broadcast=${broadcastId}`);
  };

  // Format phone numbers for display
  const formatAndJoinPhones = (phones: string[]) => {
    return phones.slice(0, 2).join(", ") + (phones.length > 2 ? `, +${phones.length - 2} more` : "");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => router.back()}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <div>
            <h1 className="text-xl font-semibold">Broadcasts</h1>
          </div>
        </div>

        {activeTab === 'contacts' && !isSelectionMode && (
          <Button
            onClick={startBroadcastSelection}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Broadcast
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#333434]">
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'broadcasts'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            My Broadcasts ({broadcasts.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'contacts'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users2 className="w-4 h-4" />
            Contacts ({totalContacts})
          </div>
        </button>
      </div>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <div className="px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-[#1E1F1F] border-b border-gray-200 dark:border-[#333434]">
          <div className="flex items-center gap-3">
            <IconButton
              onClick={clearSelection}
              label="Close Selection"
              IconSrc="/assets/icons/close.svg"
            />
            <h2 className="text-lg font-medium">{selectedContactIds.length} selected</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={selectAllContacts}
              variant="outline"
              size="sm"
            >
              Select All
            </Button>
            <Button
              onClick={createNewBroadcast}
              disabled={selectedContactIds.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Broadcast
            </Button>
          </div>
        </div>
      )}

      {/* Create Broadcast Dialog */}
      {isCreatingBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Broadcast</h3>
              <button
                onClick={() => setIsCreatingBroadcast(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Broadcast Name</label>
                <Input
                  value={broadcastName}
                  onChange={(e) => setBroadcastName(e.target.value)}
                  placeholder="Enter broadcast name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Participants ({selectedContacts.length})
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {selectedContacts.map(contact => (
                    <div key={contact.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-[#1E1F1F] rounded-lg">
                      <ContactAvatar
                        title={contact.name}
                        subtitle={formatAndJoinPhones(contact.phones)}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsCreatingBroadcast(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveBroadcast}
                  disabled={!broadcastName.trim() || isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    "Create Broadcast"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4">
        <SearchBar
          placeholder={
            activeTab === 'contacts' 
              ? "Search contacts..." 
              : "Search broadcasts..."
          }
          onSearch={setSearchTerm}
        />
      </div>

      {/* Content */}
      <div ref={sidebarRef} className="flex-1 overflow-y-auto">
        {activeTab === 'broadcasts' ? (
          // Broadcasts List
          <div className="space-y-1">
            {broadcasts.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No broadcasts yet</p>
                <p className="text-sm">Create your first broadcast list</p>
                <Button
                  onClick={() => setActiveTab('contacts')}
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Broadcast
                </Button>
              </div>
            ) : (
              broadcasts.map((broadcast) => (
                <div
                  key={broadcast.id}
                  onClick={() => openBroadcast(broadcast.id)}
                  className="mx-3 mb-1 rounded-lg group flex items-center py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2E2F2F] transition-colors"
                >
                  <ContactAvatar
                    title={broadcast.name}
                    subtitle={`${broadcast.participants} participants • ${broadcast.lastMessage || 'No messages yet'}`}
                    isGroup={true}
                    size="xl"
                    rightMenu={
                      <div className="text-xs text-gray-500">
                        {broadcast.timestamp}
                      </div>
                    }
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          // Contacts List
          <div className="space-y-1">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 mx-3 mb-1">
                  <Skeleton className="w-12 h-12 rounded-full mr-3" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                </div>
              ))
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No contacts found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContactIds.includes(contact._id!.toString());
                return (
                  <div
                    key={contact._id!.toString()}
                    className="mx-3 mb-1 rounded-lg group flex items-center py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2E2F2F] transition-colors"
                    onClick={() => isSelectionMode && toggleContactSelection(contact._id!.toString())}
                  >
                    <ContactAvatar
                      imageUrl={contact.imageUrl}
                      title={contact.name || "Unknown"}
                      subtitle={formatAndJoinPhones(contact.phones)}
                      size="xl"
                      isSelectionMode={isSelectionMode}
                      isSelected={isSelected}
                      rightMenu={
                        !isSelectionMode && (
                          <div className="text-xs text-gray-500">
                            {contact.phones.length} phone{contact.phones.length !== 1 ? 's' : ''}
                          </div>
                        )
                      }
                    />
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}