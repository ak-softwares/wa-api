"use client";

import ContactList from "@/components/dashboard/contacts/ContactList";

export default function ContactsPage() {


  return (
    <div className="min-h-screen">
      <div className="flex h-screen w-full">
        {/* Contacts Sidebar - 1/3 width */}
          <ContactList />
      </div>
    </div>
  );
}