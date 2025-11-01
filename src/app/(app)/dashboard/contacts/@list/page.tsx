import { Suspense } from "react";
import ContactsPage from "@/components/dashboard/contacts/ContactPage";

export default function ContactList() {
  return (
    <Suspense fallback={<div>Loading contacts...</div>}>
      <ContactsPage />
    </Suspense>
  );
}