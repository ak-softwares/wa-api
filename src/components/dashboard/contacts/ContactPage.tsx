"use client";

import ContactList from "@/components/dashboard/contacts/ContactList"; // 👈 your UI component
import AddContactDialog from "@/components/dashboard/contacts/AddContact";
import GoogleContactsImporter from "@/components/dashboard/contacts/GoogleContactsImporter";
import ContactSearchBar from "./SearchContacts";


export default function ContactsPage() {

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