"use client";

import { showToast } from "@/components/ui/sonner";
import { ApiResponse } from "@/types/apiResponse";
import { ImportedContact } from "@/types/Contact";
import { useState } from "react";

export const useAddContact = (onSuccess?: () => void) => {
  const [addingContact, setAddingContact] = useState(false);
  const [addingBulkContacts, setAddingBulkContacts] = useState(false);
  const [updatingContact, setUpdatingContact] = useState(false);

  const addContact = async ({ contact }: {contact: ImportedContact}) => {
    try {
      setAddingContact(true);
      const res = await fetch("/api/wa-accounts/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });

      const json: ApiResponse = await res.json();

      if (!json.success) {
        showToast.error(json.message || "Failed to save contact");
        return;
      }
      onSuccess?.();
      showToast.success("Contact saved successfully");
    } catch (e) {
      showToast.error("Error saving contact");
    }finally{
      setAddingContact(false);
    }
  };

  const addBulkContacts = async ({ contacts }: {contacts: ImportedContact[] }) => {

    if (contacts.length === 0) {
        showToast.error("No valid contacts selected");
        return;
    }

    try {
      setAddingBulkContacts(true);
      const res = await fetch("/api/wa-accounts/contacts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });

      const data = await res.json()
      if (!res.ok) {
          showToast.error(data.message || "Failed to upload contacts");
          return;
      }

      const uploaded = data.data?.uploadedCount || 0;
      const skipped = data.data?.skippedCount || 0;

      // --- Toast Messages ---
      if (uploaded > 0) {
          showToast.success(`Uploaded ${uploaded} contacts`);
      }
      if (skipped > 0) {
          showToast.warning(`${skipped} contacts were skipped (invalid or missing fields)`);
      }
      onSuccess?.(); // ✅ call only if provided
    } catch (err: any) {
      showToast.error("Failed to upload contacts");
    } finally {
      setAddingBulkContacts(false);
    }
  };

  const updateContact = async ({ contact }: { contact: ImportedContact }) => {
    if (!contact.id) {
      showToast.error("Contact id missing");
      return;
    }

    try {
      setUpdatingContact(true);

      const res = await fetch(`/api/wa-accounts/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });

      const json: ApiResponse = await res.json();

      if (!json.success) {
        showToast.error(json.message || "Failed to update contact");
        return;
      }

      showToast.success("Contact updated successfully");
      onSuccess?.();
    } catch (e) {
      showToast.error("Error updating contact");
    } finally {
      setUpdatingContact(false);
    }
  };

  return { addingContact, addContact, addingBulkContacts, addBulkContacts, updatingContact, updateContact };
};
