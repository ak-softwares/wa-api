"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ContactList from "@/components/dashboard/contacts/ContactList"; // 👈 your UI component
import { Phone, User, Search } from "lucide-react";
import AddContactDialog from "@/components/dashboard/contacts/AddContact";
import GoogleContactsImporter from "@/components/dashboard/contacts/GoogleContactsImporter";


export default function ContactsPage() {

  const [searchTerm, setSearchTerm] = useState("");

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
        <ContactList />
      </div>
    </div>
  );
}