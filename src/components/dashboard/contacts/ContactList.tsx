import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import UpdateContactDialog from "./UpdateContact";
import DeleteContactDialog from "./DeleteConstact";
import ChatTab from "./ChatWithContact";
import { useContacts } from "@/hooks/contact/useContacts";
import { User, Phone, Search } from "lucide-react";
import ContactAvatar from "./ContactAvatar";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useCallback } from "react";
import { useDebounce } from "@/hooks/common/useDebounce";
import { Button } from "@/components/ui/button";

export default function ContactList() {
  const { contacts, loading, loadingMore, hasMore, refreshContacts, searchContacts } = useContacts();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false); 
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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

  return (
    <div className="space-y-3">
      {/* 🔍 Search Bar */} 
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
          <Input placeholder="Search contacts by name or phone..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          {searchTerm && ( 
            <Button 
              variant={"ghost"}
              onClick={handleClearSearch} 
              className="absolute right-0 top-0 text-gray-500 hover:text-gray-700 hover:bg-transparent" > ✕ 
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
            <button onClick={handleClearSearch} className="text-blue-600 hover:text-blue-800 text-sm" > Clear search </button>
          </div>
        </Card> 
      )}

      {/* 📋 List Header (desktop only) */}
      <Card className="p-4 hidden md:block mt-4">
        <div className="grid grid-cols-12 gap-4 font-semibold">
          <div className="col-span-5 flex items-center">
            <User className="w-4 h-4 mr-2" /> Name 
          </div>
          <div className="col-span-4 flex items-center">
            <Phone className="w-4 h-4 mr-2" /> Phone 
          </div>
          <div className="col-span-3 text-center">Actions</div>
        </div>
      </Card>


      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-40 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="col-span-12 md:col-span-3 flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
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
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <ContactAvatar
                    imageUrl={contact.imageUrl}
                    title={contact.name}
                    subtitle={contact.email}
                  />
                  <div className="col-span-12 md:col-span-4">
                    {contact.phones.join(", ")}
                  </div>
                  <div className="col-span-12 md:col-span-3 flex justify-start md:justify-center gap-2">
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
                        // imageUrl: contact.imageUrl,
                      }}
                      onContactUpdated={refreshContacts}
                    />

                    <DeleteContactDialog
                      contactId={contact._id}
                      contactName={contact.name ?? ""}
                      onContactDeleted={refreshContacts}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {hasMore && loadingMore && (
              <>
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="col-span-12 md:col-span-3 flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
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