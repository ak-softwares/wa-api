"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useContacts } from "@/hooks/useContacts"; // 👈 your custom hook
import ContactList from "@/components/dashboard/contacts/ContactList"; // 👈 your UI component
import { IContact } from "@/types/contact";
import { Phone, Plus, User, Search } from "lucide-react";
import AddContactDialog from "@/components/dashboard/contacts/AddContacts";


export default function ContactsPage() {

  const { contacts, loading, hasMore, refreshContacts } = useContacts();
  const [searchTerm, setSearchTerm] = useState("");

  const handleMessage = (contact: IContact) => {
    console.log("Message contact:", contact);
    // you can open chat UI here
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
          
          <AddContactDialog onContactAdded={refreshContacts} />
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search contacts by name or phone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Contacts List Header */}
        <Card className="p-4 hidden md:block">
          <div className="grid grid-cols-12 gap-4 font-semibold">
            <div className="col-span-5 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Name
            </div>
            <div className="col-span-4 flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              Phone
            </div>
            <div className="col-span-3 text-center">Actions</div>
          </div>
        </Card>

        {/* Contacts List */}
        <ContactList
          contacts={contacts}
          isLoading={loading}
          handleMessage={handleMessage}
          handleEdit={refreshContacts}
          handleDelete={refreshContacts}
        />
      </div>
    </div>
  );
}