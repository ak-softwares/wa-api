"use client";
import SettingsPage from "@/components/dashboard/settings/SettingsPage";

export default function ContactsPage() {


  return (
    <div className="min-h-screen">
      <div className="flex h-screen w-full">
        {/* Contacts Sidebar - 1/3 width */}
        <div className="w-1/3 h-full">
          <SettingsPage />
        </div>
        <div className="w-2/3 flex h-full max-w-4xl mx-auto space-y-6">
          {/* Header */}
          {/* <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Contacts</h1>
              <p>Manage your contact list</p>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
              <GoogleContactsImporter />
              <AddContactDialog />
            </div>
          </div>
          <ContactList /> */}
        </div>
      </div>
    </div>
  );
}