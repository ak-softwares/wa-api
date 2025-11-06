'use client';

import { Suspense } from "react";
import ContactList from "@/components/dashboard/contacts/ContactList";

export default function ContactsPage() {
  return (
    <Suspense>
      <div className="w-full h-screen">
        <ContactList />
      </div>
    </Suspense>
  );
}