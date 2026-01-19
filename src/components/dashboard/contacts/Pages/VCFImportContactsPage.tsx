"use client";

import IconButton from "@/components/common/IconButton";
import { useContactStore } from "@/store/contactStore";
import { ImportedContact } from "@/types/Contact";
import { useAddContact } from "@/hooks/contact/useAddContact";

import VCFContactsImporter from "@/components/common/Excel/VCFContactsImporter";

export default function VCFImportContactsPage() {
  const { setSelectedContactMenu } = useContactStore();

  const { addingBulkContacts, addBulkContacts } = useAddContact(() => {
    window.location.reload();
  });

  // ✅ when import done, upload contacts
  const handleVCFImport = async (contacts: ImportedContact[]) => {
    await addBulkContacts({ contacts });
  };

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => setSelectedContactMenu(null)}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <h1 className="text-xl font-semibold">Import Contacts from VCF</h1>
        </div>
      </div>

      {addingBulkContacts ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 w-[320px] flex flex-col items-center gap-4">
            {/* Spinner */}
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-green-500 animate-spin" />

            <div className="text-center">
              <p className="font-semibold text-base">Uploading Contacts…</p>
              <p className="text-sm text-gray-500">Please wait a moment</p>
            </div>
          </div>
        </div>
      ) : (
        <VCFContactsImporter onImportContacts={handleVCFImport} />
      )}
    </div>
  );
}
