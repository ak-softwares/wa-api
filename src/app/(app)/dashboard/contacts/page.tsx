// app/dashboard/contacts/page.tsx
import { Suspense } from "react";
import ContactsPage from "@/components/dashboard/contacts/ContactPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading contacts...</div>}>
      <ContactsPage />
    </Suspense>
  );
}
