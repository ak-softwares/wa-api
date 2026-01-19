"use client";

import { Contact, ImportedContact } from "@/types/Contact";
import IconButton from "@/components/common/IconButton";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useContactStore } from "@/store/contactStore";
import parsePhoneNumberFromString, { CountryCode } from "libphonenumber-js";
import ContactAvatar from "../contacts/common/ContactAvatar";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import ExcelContactsImporter from "@/components/common/Excel/ExcelContactsImporter";
import { ChatParticipant } from "@/types/Chat";
import { useBroadcast } from "@/hooks/broadcast/useBroadcast";
import { toast } from "@/components/ui/sonner";
import ContactImporter from "../contacts/common/ContactsImporter";
import { useChatMenuStore } from "@/store/chatMenu";

type Props = {
  onBack?: () => void;
  // for EDIT mode (optional)
  broadcastId?: string;
  initialBroadcastName?: string;
  initialParticipants?: ChatParticipant[];
};

export default function BroadcastPage({ onBack, broadcastId, initialBroadcastName, initialParticipants = [] }: Props) {
  const isEditMode = !!broadcastId;
  const [broadcastName, setBroadcastName] = useState<string>(initialBroadcastName ? initialBroadcastName : "");
  const [contacts, setContacts] = useState<ChatParticipant[]>(initialParticipants);
  const { setSelectedContactMenu } = useContactStore();
  const { setChatMenu } = useChatMenuStore();
  const [viewMode, setViewMode] = useState<"broadcast" | "excel" | "contacts">("broadcast");
  const { creatingBroadcast, createBroadcast, updatingBroadcast, updateBroadcast } = useBroadcast(() => {
    // optional success callback
    setBroadcastName("");
    setContacts([]);
  });

  const handelOnBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    setChatMenu(null);
    setSelectedContactMenu(null);
  };

  const formatPhone = (number: string, defaultCountry: CountryCode = "IN") => {
    const phoneNumber = parsePhoneNumberFromString(number, defaultCountry);
    return phoneNumber ? phoneNumber.formatInternational() : number;
  };

  const handleRemoveContact = (contactNumber: string) => {
    setContacts((prev) => prev.filter((c) => c.number !== contactNumber));
  };

  const canCreate = useMemo(() => {
    return broadcastName.trim().length > 0 && contacts.length > 0;
  }, [broadcastName, contacts]);

  const handleCreateBroadcast = async () => {
    if (!broadcastName.trim()) {
      toast.error("Please enter broadcast name");
      return;
    }

    if (contacts.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    // ✅ EDIT mode
    if (isEditMode) {
      await updateBroadcast({
        broadcastId,
        broadcastName,
        participants: contacts,
      });
    }else{
      // ✅ CREATE mode
      await createBroadcast({
        broadcastName,
        participants: contacts,
      });
    }
    if (onBack) {
      onBack();
      // window.location.reload(); // ❗hard reload
    }
  };

  // ✅ when import done, merge contacts into broadcast contacts
  const handleExcelImport = (imported: ImportedContact[]) => {
    setContacts((prev) => {
      const existingNumbers = new Set(prev.map((x) => x.number));

      const uniqueNew: ChatParticipant[] = imported
        .map((c) => ({
          name: c.name,
          number: c.phones?.[0] ?? "", // take first phone
          imageUrl: c.imageUrl,
        }))
        .filter((c) => c.number && !existingNumbers.has(c.number));

      return [...prev, ...uniqueNew];
    });

    setViewMode("broadcast");
  };


  const handleContatImport = (imported: Contact[]) => {
    setContacts((prev) => {
      const existingNumbers = new Set(prev.map((x) => x.number));

      const uniqueNew: ChatParticipant[] = imported
        .map((c) => ({
          name: c.name,
          number: c.phones?.[0] ?? "",
          imageUrl: c.imageUrl || undefined,
        }))
        .filter((p) => p.number && !existingNumbers.has(p.number));

      return [...prev, ...uniqueNew];
    });

    setViewMode("broadcast");
  };

  // ---------------------------------------------------
  // NORMAL BROADCAST UI
  // ---------------------------------------------------
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={handelOnBack}
            label="Back"
            IconSrc="/assets/icons/arrow-left.svg"
          />
          <h1 className="text-xl font-semibold">{isEditMode ? "Edit Broadcast" : "Make a Broadcast"}</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant={"outline"} onClick={() => setViewMode("contacts")}>
            <Image
              src="/assets/icons/contacts.svg"
              alt="Import form Contacts"
              width={22}
              height={22}
              className="dark:invert"
            />
            Import form Contacts
          </Button>
          <Button variant={"outline"} onClick={() => setViewMode("excel")}>
            <Image
              src="/assets/icons/download.svg"
              alt="Import form Excel"
              width={18}
              height={18}
              className="dark:invert"
            />
            Import form Excel
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "contacts" && (
          <ContactImporter
            onBack={() => setViewMode("broadcast")}
            onImportContacts={handleContatImport}
          />
        )}

        {viewMode === "excel" && (
          <ExcelContactsImporter
            onBack={() => setViewMode("broadcast")}
            onImportContacts={handleExcelImport}
          />
        )}

        {viewMode === "broadcast" && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* TOP FORM */}
            <div className="p-5 space-y-5 shrink-0">
              {/* Broadcast Name */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Broadcast Name
                </label>
                <Input
                  value={broadcastName}
                  onChange={(e) => setBroadcastName(e.target.value)}
                  placeholder="Enter broadcast name"
                />
              </div>

              {/* Participants Label */}
              <label className="text-sm font-medium block">
                Participants ({contacts.length})
              </label>
            </div>

            {/* ✅ ONLY LIST SCROLLS */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {contacts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No participants selected.
                </p>
              ) : (
                <div className="space-y-2 pr-2">
                  {contacts.map((contact) => {
                    const displayName = contact.name || formatPhone(String(contact.number)) || "Unknown";
                    return (
                      <div key={contact.number || displayName}>
                        <ContactAvatar
                          title={displayName}
                          subtitle={contact.number}
                          imageUrl={contact.imageUrl}
                          rightMenu={
                            contact.number && (
                              <button
                                onClick={() => handleRemoveContact(contact.number)}
                                className="p-2 hover:opacity-80 transition"
                              >
                                <Image
                                  src="/assets/icons/close.svg"
                                  alt="Remove"
                                  width={18}
                                  height={18}
                                  className="dark:invert"
                                />
                              </button>
                            )
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="p-5 border-t dark:border-[#333434] shrink-0">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!canCreate || creatingBroadcast || updatingBroadcast}
                onClick={handleCreateBroadcast}
              >
                {
                  creatingBroadcast || updatingBroadcast
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Broadcast"
                      : "Create Broadcast"
                }
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
