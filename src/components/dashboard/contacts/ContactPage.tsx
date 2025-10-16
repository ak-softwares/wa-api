"use client";

import ContactList from "@/components/dashboard/contacts/ContactList";
import AddContactDialog from "@/components/dashboard/contacts/AddContact";
import GoogleContactsImporter from "@/components/dashboard/contacts/GoogleContactsImporter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export default function ContactsPage() {

  const [isLoading, setIsLoading] = useState(false);

  const selectedContacts = [
    { number: "918265849298" },
    { number: "919368994493" },
  ];

  const createBroadcast = async () => {
    if (!selectedContacts || selectedContacts.length === 0) {
      toast.error("Please select at least one contact!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/whatsapp/chats/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broadcastName: "braodcast1", participants: selectedContacts }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create broadcast chat");
      }

      toast.success("Broadcast chat created successfully");
    } catch (err: any) {
      toast.error(`Error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p>Manage your contact list</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
            <GoogleContactsImporter />
            <AddContactDialog />
          </div>
        </div>

        {/* Search Bar */}
        {/* <ContactSearchBar /> */}

        {/* Contacts List */}
        <ContactList />
      </div>
    </div>
  );
}